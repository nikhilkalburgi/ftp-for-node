const FtpClient = require("../client/index");
const ftp = new FtpClient();
ftp.dataChannel.port = 3000;
ftp.localSite = "E:\\project\\ftp-for-node\\";
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
    ftp.LIST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.PASV((err,msg)=>{
        console.log(err,msg);
    })
    ftp.NLST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.NLST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.PASV((err,msg)=>{
        console.log(err,msg);
    })
    ftp.LIST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.QUIT((err,msg)=>{
        console.log(err,msg)
    })
})

ftp.connect();