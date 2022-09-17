const net = require("net");
const {handleUser,handlePassword} = require("./authorization.js");
var command = null;
var args = [];
class FtpServer{
    constructor(){
        this.remotePort = null;
        this.localPort = 21;
        this.remoteAddress = null;
        this.localAddress = "localhost";
        this.userDetails = [];
    }

    initiateFtpServer(){
        const ftpServer = net.createServer((ftpSocket)=>{
            ftpSocket.write("220 Service ready for new user\r\n")
            ftpSocket.on("connect",()=>{
            })

            ftpSocket.on("data",(data)=>{
                let parsedData = data.toString().split(" ");
                command = parsedData[0].toUpperCase();
                args = parsedData.slice(1);
                args = args.map((value)=>{return value.replace("\r\n","")})
                console.log(command,args);
                switch(command){
                    case "USER":{
                        handleUser(ftpSocket,args,this.userDetails);
                        command = null;
                        args = [];
                        break;
                    }
                    case "PASS":{
                        handlePassword(ftpSocket,args,this.userDetails);
                        command = null;
                        args = [];
                        break;
                    }
                    case "PORT":{
                        handlePort(ftpSocket,args);
                        command = null;
                        args = [];
                        break;
                    }
                    case "NLST":{
                        handleNlist(ftpSocket,args);
                        command = null;
                        args = [];
                        break;
                    }
                    case "OPTS":{
                        ftpSocket.write("200 Always in UTF8 mode\r\n");
                    }
                }
            })

            ftpSocket.on("error",(error)=>{
                console.log(error);
            })

            ftpSocket.on("close",(error)=>{
                if(error){
                    console.log("Socket had a transmission error")                    
                }else{
                    console.log("Connection Closed.") 
                }
            })
        })
        ftpServer.listen(this.localPort,()=>{
            console.log(`Starting FTP Service at port ${this.localPort}`)
        }) 
    }
}


let s = new FtpServer();
s.initiateFtpServer();