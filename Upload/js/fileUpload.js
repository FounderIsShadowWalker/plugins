window.onload = function () {
    var file = document.querySelector("input[type='file']"),
        upload = document.querySelector('#upload'),
        main = document.querySelector('#main'),
        mask = document.querySelector("#shadow"),
        cancel = document.querySelector('#cancel'),
        upload_list = document.querySelector('.upload_list'),
        elastic = document.querySelector('#elastic');

    var util = {
        css: function (dom, attr) {
            return window.getComputedStyle(dom, null)[attr].replace(/[a-zA-Z]/g, "");
        }
    }


    elastic.onclick = function () {
        if(util.css(upload_list, 'width') == 200) {
            upload_list.style.width = '100px';
        }
        else{
            upload_list.style.width = '200px';
        }
    }

    file.addEventListener('change', function () {

        var filesLight = [],
            filesHeavy = [];

        var files = this.files.length > 1 ? [].slice.call(this.files) : [this.files[0]];
        var heavyFilesSize = 0;
        var allSize = 0;
        var lightFileSize = 0;
        var transimitSize = 0;
        var uploadOptions = mask.innerHTML;

        upload.onclick = null;
        var promiseQueque = [];

        //读取各个文件
        files.forEach(function (file, index) {
            promiseQueque.push(new Promise(function (resolve, reject) {
                    var reader = new FileReader();
                    var img = new Image();
                    reader.readAsDataURL(file);
                    reader.onload = function (e) {
                        if (/jpg|png|jpeg/.test(file.type)) {
                            img.src = e.target.result;
                        }
                        else{
                            img.src = "cat.jpg";
                            img.width = 200;
                            img.height = 200;
                        }

                        file.size < 1024 * 1024 * 1 ? filesLight.push(e.target.result) : (filesHeavy.push(file), heavyFilesSize += file.size);
                        main.appendChild(img);

                        var width = util.css(img, 'width'),
                            height = util.css(img, 'height');

                        img.height = 200;
                        img.width = width / height * 200;

                        resolve(file.name);
                    };
                })
            )
        })

        //上传文件小于10m的文件
        new Promise(function (resolve, reject) {
            Promise.all(promiseQueque).then(function () {
                mask.style.display="block";
                var filesName = [].concat.apply([], [].slice.call(arguments));

                cancel.onclick = function () {
                    window.location.reload(true);
                }

                upload.onclick = function () {

                    //任务完成后添加
                    var setProgress = progress(function () {
                        var imgs = [].slice.call(document.querySelectorAll('img'));
                        imgs.forEach(function (img) {
                            img.parentNode.removeChild(img);
                        })

                        var ps = [].slice.call(document.querySelectorAll('p'));
                        ps.forEach(function (p) {
                            filesName.indexOf(p.innerHTML) > -1 && (p.style.color = 'green');
                        })
                        mask.style.display = "none";
                        mask.innerHTML = uploadOptions;
                    });

                    var xhr = new XMLHttpRequest();
                    var formData = new FormData();
                    formData.append("accountname", 'fffff');

                    for(var i=0; i<filesLight.length; i++){
                        formData.append('lightFile_'+i, filesLight[i]);
                    }

                    xhr.open('post',  'http://localhost:3000/light');
                    xhr.timeout = 3000;
                    xhr.ontimeout = function() {
                        alert('请求超时！');
                    }

                    xhr.upload.onprogress = function (event) {
                        if(event.lengthComputable) {
                            var percentComplete = event.loaded / (event.total + heavyFilesSize);
                            allSize = event.total + heavyFilesSize;
                            transimitSize = event.total;
                            setProgress(percentComplete);
                        }
                    }

                    filesName.forEach(function (item) {
                        var textNode = document.createTextNode(item);
                        var p = document.createElement('p');
                        p.appendChild(textNode);
                        upload_list.append(p);
                    });

                    xhr.send(formData);

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200 ) {
                                resolve(setProgress);
                        }
                    }
                }


            })
        })
            .then(
                //上传文件大于10m的文件
                function(setProgress){
                    filesHeavy.forEach(function (file, index) {
                        var shareSize =  2 * 1024 * 1024,
                            shareCount = Math.ceil(file.size / shareSize),
                            i=0;

                        console.log('分片数目:' + shareCount);

                        sendSlice(i);

                        function sendSlice(i) {
                            var xhr = new XMLHttpRequest();

                            var start = i * shareSize,
                                end = Math.min(file.size, start + shareSize);


                            xhr.open('post',  'http://localhost:3000/heavy');
                            xhr.timeout = 3000;
                            xhr.ontimeout = function() {
                                alert('请求超时！');
                            }

                            var sliceFile = file.slice(start, end);

                            transimitSize += sliceFile.size;

                            var formData = new FormData();
                                formData.append(file.name +  '_' + i, sliceFile);

                            xhr.send(formData);

                            xhr.onreadystatechange = function () {
                                if (xhr.readyState == 4 && xhr.status == 200) {
                                    if(i < shareCount - 1) {
                                        sendSlice(++i);
                                        setProgress(Math.ceil(transimitSize / allSize));
                                    }
                                }
                            }
                        }
                    })
                }
            )
    })

    function progress(callback) {
        var wrap = document.querySelector('#wrap'),
            h3 = document.querySelector('#wrap h3'),
            button_group = document.querySelector('#wrap #button_group');

        h3.innerHTML = 'waiting....';
        button_group.innerHTML = '<div id="progress"><div class="inner-progress"></div>';

        var progress = document.querySelector('#progress');
        var inner_progress =  document.querySelector('#progress .inner-progress');
        var progressLength = util.css(progress, 'width');

        return function (percent) {
            inner_progress.style.width = progressLength * percent + 'px';
            percent === 1 &&  (h3.innerHTML = 'Done') && setTimeout(function(){ callback()}, 1000);
        }
    }
}