var exec = require('child_process').exec;

module.exports.command = function (path) {
    exec(path, function (error, stdout, stderr) {
        if (!error) {
            console.log(stdout);
        } else {
            console.log(error);
        }
    });
}