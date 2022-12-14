//Import
const FtpClient = require("../client/index.js");
const fs = require('fs');
const ftp = new FtpClient();

//Specify the available port for data-channel
ftp.dataChannel.port = 3000;

//For Local folder 
ftp.localSite = "E:\\nodefiles\\folder name\\";

//For Authorization - optional for anonymous
ftp.user = "abc";
ftp.password = "123";
ftp.secureOptions.key = fs.readFileSync('key.pem');
ftp.secureOptions.cert = fs.readFileSync('cert.pem');

//"connect" - Listener
ftp.on("connect",(code,msg)=>{
    console.log(code,msg);
    ftp.PORT("127,0,0,1,11,184",(err,msg)=>{
        console.log(err,msg);
    })
    ftp.PWD((err,pwd)=>{
        console.log(err,pwd);
    })
    ftp.TYPE('I',(err,pwd)=>{
        console.log(err,pwd);
    })
    ftp.AUTH('tls',(err,msg)=>{
        console.log(err,msg)
    })
    ftp.PASV((err,msg)=>{
        console.log(err,msg)
    })
    ftp.CWD('E:\\nodefiles',(err,msg)=>{
        console.log(err,msg)
    })
    ftp.STOR("./package-lock.json",(err,msg)=>{
        console.log(err,msg);
    })
    ftp.QUIT((err,msg)=>{
        console.log(err,msg);
    })

})

//Init Client
ftp.connect();