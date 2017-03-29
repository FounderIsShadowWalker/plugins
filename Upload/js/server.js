var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');




http.createServer(function (req, res) {

    var form = new formidable.IncomingForm();
    form.uploadDir = '../img/';//上传文件的保存路径
    form.keepExtensions = true;//保存扩展名
    form.maxFieldsSize = 20 * 1024 * 1024;//上传文件的最大大小

    res.writeHeader(200, {'Content-type': 'text/html','Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
        'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS'
    });

    //这里formidable会对upload的对象进行解析和处理
    form.parse(req, function(err, fields, files) {
        console.log(fields, files);
        for(var i in files){
            console.log(files[i].path);
        }

        res.end('上传成功');
        });

}).listen(3000);