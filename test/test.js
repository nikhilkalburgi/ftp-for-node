const FtpServer = require("../server");
const fs = require('fs');
const server = new FtpServer();
server.defaultPWD = "E:/nodefiles/New";
server.secureOptions.key = fs.readFileSync('key.pem');
server.secureOptions.cert = fs.readFileSync('cert.pem');
server.userDetails = [{name:"abc",password:"123",pwd:"E:/nodefiles"}];
server.initiateFtpServer();