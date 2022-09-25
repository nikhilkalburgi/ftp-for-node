const FtpClient = require("../client/index");
const ftp = new FtpClient();
ftp.dataChannel.port = 3000;
ftp.localSite = "E:\\project\\ftp-for-node\\";
ftp.user = "abc";
ftp.password = "123";
ftp.on("connect",(code,msg)=>{
    console.log(code,msg);
    ftp.PORT("127,0,0,1,11,184",(err,msg)=>{
        console.log(err,msg);
    })
    ftp.TYPE("I",(err,msg)=>{
        console.log(err,msg)
    })
    ftp.PWD((err,pwd)=>{
        console.log(err,pwd);
    })
    ftp.LIST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.CWD("E:/nodefiles/folder name/node_modules",(err,msg)=>{
        console.log(err,msg)
    })
    ftp.LIST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.QUIT((err,msg)=>{
        console.log(err,msg);
    })

})

ftp.connect();