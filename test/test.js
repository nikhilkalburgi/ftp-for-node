const FtpServer = require("../server");
const server = new FtpServer();
server.defaultPWD = "E:/nodefiles";
server.userDetails = [{name:"abc",password:"123",pwd:"E:\\nodefiles"}];
server.initiateFtpServer();