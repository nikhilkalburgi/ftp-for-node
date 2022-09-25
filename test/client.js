//Import
const FtpClient = require("ftp-for-node/client");
const ftp = new FtpClient();

//Specify the available port for data-channel
ftp.dataChannel.port = 3000;

//For RETR
ftp.localSite = "E:\\project\\ftp-for-node\\";

//For Authorization - optional for anonymous
ftp.user = "abc";
ftp.password = "123";

//"connect" - Listener
ftp.on("connect",(code,msg)=>{
    console.log(code,msg);
    ftp.PORT("127,0,0,1,11,184",(err,msg)=>{
        console.log(err,msg);
    })
    ftp.PWD((err,pwd)=>{
        console.log(err,pwd);
    })
    ftp.LIST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.QUIT((err,msg)=>{
        console.log(err,msg);
    })

})

//Init Client
ftp.connect();