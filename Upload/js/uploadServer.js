var http = require('http');
var fs = require('fs');
var field = {
    formDataValue: [],
    files: []
};

//处理formdata 字符串 键值对
function dealFormDataValue(str) {
    var result = str.match(/name=\"(.*)?\"(?:[\r\n]+)?(.*)?(?:[\r\n]+)?/);

    field.formDataValue.push({
        key: result[1],
        value: result[2]
    })
    console.log(field);
}

//处理formdata 文件
function dealFormDataFile(str) {
    var result = str.match(/name=\"(.*)?\"(?:[\r\n]+)?(.*)?(?:[\r\n]+)?/);

    field.files.push({
        filename: result[1],
        path: result[2]
    })

    field.files.forEach(function (file) {
        var ext = ".";
        var base64Data = file.path.replace(/data:(?:\w+)?\/(\w+)?;base64,/, function(str, str1){
            ext += str1;
            return '';
        });

        var path = '../img/' + file.filename + ext;
        var dataBuffer = new Buffer(base64Data, 'base64');

        fs.writeFileSync(path , dataBuffer);
    })

    // console.log(field);
}

http.createServer(function (req, res) {
    var chunks = [];
    var size = 0;
    var isStart = false;
    var ws;
    var num = 0;
    var fileSays = [];
    var filename;
    var path;

    if(req.url === '/heavy' && req.method.toLowerCase() == 'post'){
        req.on('data', function (chunk) {
            var start = 0,
                end = chunk.length;

            var rems = [];


            for(var i=0;i<chunk.length;i++){
                if(chunk[i]==13 && chunk[i+1]==10) {
                    num++;
                    rems.push(i);

                    if (num == 4) {
                        start = i + 2;
                        isStart = true;
                        var str = (new Buffer(fileSays)).toString();

                        filename = str.match(/(\b)name=\"((?:.*)?\.(?:\w+))_(?:\w+)\"/)[2];

                        path = '../file/' + filename;

                        ws = fs.createWriteStream(path, {flags: 'a'});
                    }
                    else if (i === chunk.length - 2) {
                        end = rems[rems.length - 2];
                        break;
                    }
                }

                if(num<4){
                    fileSays.push(chunk[i])
                }
            }

            if(isStart){
                ws.write(chunk.slice(start , end));
            }

        });

        req.on("end", function () {
            ws.end();
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
            });
            res.end('');

        });
    }
    else if(req.url = '/light' && req.method.toLowerCase() == 'post') {
        req.on('data', function (chunk) {
            chunks.push(chunk);
            size += chunk.length;
        });

        req.on("end", function () {
            var fileBinary;
            var buffer = Buffer.concat(chunks, size);
            if (!size) {
                res.writeHead(404);
                res.end('');
                return;
            }

            var rems = [];

            // console.log(buffer);
            // console.log(buffer.toString());
            //根据\r\n分离数据和报头
            for (var i = 0; i < buffer.length; i++) {
                var v = buffer[i];
                var v2 = buffer[i + 1];

                if (v == 13 && v2 == 10) {
                    rems.push(i);
                }
            }

            var set = buffer.toString().split(/------WebKitFormBoundary(?:.+)?\r\n/), length = set.length;
            set = set.slice(1, length - 1);
            //console.log(set);


            set.forEach(function (item) {
                if (/data:/.test(item)) {
                    fileBinary = dealFormDataFile(item);
                }
                else {
                    dealFormDataValue(item);
                }
            })

            res.writeHead(200, {
                'Access-Control-Allow-Methods': 'OPTIONS, HEAD, POST',
                'Access-Control-Allow-Origin': '*',
            });
            res.end('Light上传完毕');

        });
    }
    else if(req.method.toLowerCase() == 'options'){
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
        });
        res.write('received upload:\n\n');
        res.end();
        return;
    }
}).listen(3000);



