var node_path=require('path');
var fs=require('fs');
var excludePath = ['bower', 'node_modules'];
var ext = ['scss', 'js', 'html', 'jsx'];
var start = 0, end = 0, last = 0;
const limitation = 10;

//模拟async.map的执行
function myMap(arrayData,call,resultCallback){
    var p=arrayData;
    var finalResultData=[];
    var intercall=function(error,resultData){
        watchLength--;
        finalResultData.push(resultData);
        if(watchLength==0){
            resultCallback(null,finalResultData);
        }
    };
    var watchLength=p.length;
    for(var i=0;i< p.length;i++){
        call(p[i],intercall);
    }

}

//获取目录下的所有文件信息
function getDir(dir_path,finalCallback){
    //var path=node_path.join(__dirname,dir_path);
    var path = dir_path;
    var over=[];
    var watchProcessDir=[];
    watchProcessDir.push(path);
    function judgeAllDone(path){
        watchProcessDir.splice(watchProcessDir.indexOf(path),1);

        if(watchProcessDir.length==0){
            //全部结束了
            finalCallback(over);
            return true;
        }else{
            return false;
        }
    }

    function forDir(path){
        fs.readdir(path,function(err,files){
            if(err){
                return false;
            }
            if(!files||files.length==0){
                judgeAllDone(path);
                return;
            }
            myMap(files,function(e,cb){
                var paths=node_path.join(path,e);
                fs.stat(paths,function(err,file){
                    if(file.isDirectory()){
                        //目录不为空
                        cb(null,paths)
                    }else{
                        if(contains(paths.slice(paths.lastIndexOf('.') + 1))) {
                            over.push(paths)
                        }
                        cb(null,'');

                    }
                });
            },function(err,results){
                if(results.join('')!=''){
                    //去掉空字符串
                    results=results.filter(function(item){
                        return !!item && exclude(item);      // "" -> false && "node_modules bower"
                    });
                    watchProcessDir=watchProcessDir.concat(results);
                    results.forEach(function(e){
                        forDir(e);
                    });
                }

                judgeAllDone(path);

            })
        })
    }

    forDir(path);

}

function contains(path) {
    for(var i=0; i<ext.length; i++){
        if(ext[i] === path){
            return true;
        }
    }
    return false;
}

function exclude(item) {
    for(var i=0; i<excludePath.length; i++){
        if(item.indexOf(excludePath[i]) > 0){
            return false;
        }
    }
    return true;
}

function readFiles(over, cb) {
    var length = over.length;

    var allLength = 0;
    for(var i=0; i<over.length; i++){
        fs.readFile(over[i],'utf-8',function(err,data){
            if(err){
                console.log("error");
            }else{
                data.replace(/\n/g, function () {
                    allLength++;
                })
                length --;

                if(length === 0){
                    cb(allLength);
                }
            }
        });
    }
}

module.exports  =  function wrap(path) {
    return new Promise(function (resolve, reject) {
        getDir(path, function (over) {
            readFiles(over, function (output) {
                start > 0 ? (end = output) : (start = output, last = output);
                console.log(start,  end, last);
                var para = {
                    line: output,
                    start: start,
                    end: end,
                    last: last
                }
                resolve(JSON.stringify(para));
                end > 0 && (last = end);
            });
        });
    })

}

