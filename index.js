const net = require("net");
const {handleUser,handlePassword} = require("./authorization.js");
const {handleNlist,handleList,emptyFiles} = require("./list.js");
const {handleCwd,handleMkd,handlePwd,handleRmd} = require("./dirOperations.js");
const {handleType,handlePasv} = require('./modes.js');
var command = null;
var args = [];
class FtpServer{
    constructor(){
        this.localPort = 21;
        this.localAddress = "localhost";
        this.userDetails = [];
        this.passive = {
            active : true,
            address : null,
            port : null
        }
    }
    
    initiateFtpServer(){
        const ftpServer = net.createServer((ftpSocket)=>{
            var remoteAddress = null;
            var remotePort = null;
            var connectedUser = null;
            var type = 'A';
            var passive = false;
            ftpSocket.write("220 Service ready for new user\r\n")
            ftpSocket.on("connect",()=>{
            })

            ftpSocket.on("data",(data)=>{
                let parsedData = data.toString().split(" ");
                command = parsedData[0].replace("\r\n","").toUpperCase();
                args = parsedData.slice(1);
                args = args.map((value)=>{return value.replace("\r\n","").trim()})
                console.log(command,args);
                switch(command){
                    case "USER":{
                        connectedUser = handleUser(ftpSocket,args,this.userDetails);
                        command = null;
                        args = [];
                        break;
                    }
                    case "PASS":{
                        handlePassword(ftpSocket,args,connectedUser);
                        command = null;
                        args = [];
                        break;
                    }
                    case "PORT":{
                        let [a1,a2,a3,a4,p1,p2] = args[0].split(',');
                        p2.replace("\r\n","");
                        p1 = Number.parseInt(p1);
                        p2 = Number.parseInt(p2);
                        remotePort = p1*256 + p2;
                        remoteAddress = `${a1}.${a2}.${a3}.${a4}`;
                        ftpSocket.write("200 PORT Okay\r\n")
                        command = null;
                        args = [];
                        break;
                    }
                    case "NLST":{
                        handleNlist(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type);
                        command = null;
                        args = [];
                        break;
                    }
                    case "LIST":{
                        handleList(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,type);
                        command = null;
                        args = [];
                        break;
                    }
                    case "PWD":{
                        handlePwd(ftpSocket,args,connectedUser);
                        command = null;
                        args = [];
                        break;
                    }
                    case "CWD":{
                        handleCwd(ftpSocket,args,connectedUser);
                        command = null;
                        args = [];
                        break;
                    }
                    case "MKD":{
                        handleMkd(ftpSocket,args,connectedUser);
                        command = null;
                        args = [];
                        break;
                    }
                    case "XMKD":{
                        handleMkd(ftpSocket,args,connectedUser);
                        command = null;
                        args = [];
                        break;
                    }
                    case "RMD":{
                        handleRmd(ftpSocket,args,connectedUser);
                        command = null;
                        args = [];
                        break;
                    }
                    case "XRMD":{
                        handleRmd(ftpSocket,args,connectedUser);
                        command = null;
                        args = [];
                        break;
                    }
                    case "OPTS":{
                        ftpSocket.write("200 Always in UTF8 mode\r\n");
                        break;
                    }
                    case "SYST":{
                        ftpSocket.write("421 Service not available\r\n");
                        break;
                    }
                    case "FEAT":{
                        ftpSocket.write("421 Service not available\r\n");
                        break;
                    }
                    case "TYPE":{
                        type = handleType(ftpSocket,args);
                        break;
                    }
                    case "PASV":{
                        passive = handlePasv(ftpSocket,args,this.passive);
                        break;

                    }
                    case "REIN":{
                        if(args.length){
                            ftpSocket.write("500 Syntax error, command unrecognized\r\n");
                            break;
                        }
                        connectedUser.pwd = this.userDetails.pwd;
                        ftpSocket.end("221 Service closing control connection");
                        break;
                    }
                    case "QUIT":{
                        if(args.length){
                            ftpSocket.write("500 Syntax error, command unrecognized\r\n");
                            break;
                        }
                        emptyFiles(connectedUser);
                        connectedUser = null;
                        ftpSocket.end("221 Service closing control connection");
                        break;
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
s.userDetails = [{name:"abc",password:"123",pwd:"E://project/ftp-for-node"},{name:"def",password:"456",pwd:"E://project"}]
s.initiateFtpServer();