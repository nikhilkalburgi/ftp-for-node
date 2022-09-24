const FtpServer = require("../server");
const server = new FtpServer();
server.defaultPWD = "E:/nodefiles";
server.initiateFtpServer();