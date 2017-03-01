var test = require('./main.js');
var command = require('./process.js');
var limitation = 500;


setInterval(function () {
    test().then(function (para) {
        if(JSON.parse(para).end != 0 && JSON.parse(para).end - JSON.parse(para).start > limitation) {
            //处理复制粘贴
            if(JSON.parse(para).end - JSON.parse(para) > 10){
                limitation += JSON.parse(para).end - JSON.parse(para);
            }else {
                console.log('所有文件行数', JSON.parse(para).end, "累计编写行数:", JSON.parse(para).end - JSON.parse(para).start, "当前增加:" + JSON.parse(para).last);
                command.command('./shut.sh');
            }
        }
    });
}, 1000);

