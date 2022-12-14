const net = require("net");
const fs = require("fs");
const os = require("os");
const tls = require("tls");
const path = require("path");
const {handleUser,handlePassword} = require("./authorization.js");
const {handleNlist,handleList,emptyFiles} = require("./list.js");
const {handleCwd,handleMkd,handlePwd,handleRmd,handleCdup,handleRnfr,handleRnto} = require("./dirOperations.js");
const {handleType,handlePasv} = require('./modes.js');
const { handleStor,handleRetr,handleDele,handleAppe,handleStou } = require("./fileOperations.js");
var command = null;
var args = [];
class FtpServer{
    constructor(){
        this.localPort = 21;
        this.localAddress = "localhost";
        this.userDetails = [];
        this.passive = {
            active : true,
            address : "127.0.0.1",
            port : 40001
        }
        this.secureOptions = {
            key : null,
            cert : null
        }
        this.defaultPWD = null;
    }

    checkUserInput(){
        if(!Array.isArray(this.userDetails) || typeof this.localPort != "number" || typeof this.localAddress != "string" || typeof this.passive != "object"){
            console.log("Error : Invalid Type");
            return false;
        }
        if(typeof this.passive.active != "boolean" || typeof this.passive.address != "string" || typeof this.passive.port != "number"){
            console.log("Error : Invalid Type");
            return false;
        }
        for (let user of this.userDetails){
            if(typeof user.name != "string" || typeof user.password != "string" || typeof user.pwd != "string"){
                console.log("Error : User details Invalid.");
                return false;
            }
            user.pwd = user.pwd.replace(/"\\"/g,"/");
            user.pwd = user.pwd.split("");
            if(user.pwd[user.pwd.length-1] == '/')
            user.pwd.pop();
            if(user.pwd[user.pwd.length-2] == '/')
            user.pwd.pop();   
            user.pwd = path.normalize(user.pwd.join(""));
            if(fs.existsSync(user.pwd)){
            if( process.platform == "win32" && user.pwd.indexOf('/') != 0 && user.pwd.indexOf('./') != 0){
            }else if(process.platform != "win32" && user.pwd.indexOf('/') == 0 && user.pwd.indexOf('./') != 0){
            }else{
                console.log("Error : The PWD is Invalid.");
                return false;
            }        
            }else{
                console.log("Error : The PWD is Invalid.");
                return false;
            }
        }
        if(!this.defaultPWD){
            console.log("Error : The defaultPWD is NIL.");
            return false;
        }else{
            this.defaultPWD = path.normalize(this.defaultPWD);
        if(!fs.existsSync(this.defaultPWD)){
            console.log("Error : The defaultPWD is Invalid.");
            return false;
        }
        }

        return true;
    }

    initiateFtpServer(){
        try{

            if(this.checkUserInput()){
                const ftpServer = net.createServer((ftpSocket)=>{
                    ftpSocket.setEncoding("utf8");
                    var remoteAddress = null;
                    var remotePort = null;
                    var connectedUser = null;
                    var type = 'A';
                    var passive = false;
                    var auth = false;
                    function makeItActive(){
                        passive = false;
                    }
                    var originalPWD = this.defaultPWD;
                    ftpSocket.write("220 Service ready for new user\r\n")

                    function handleData(data){
                        let parsedData = data.split(" ");
                        command = parsedData[0].replace("\r\n","").toUpperCase();
                        args = parsedData.slice(1);
                        args = args.map((value)=>{return value.replace("\r\n","").trim()})
                        switch(command){
                            case "USER":{
                                connectedUser = handleUser(ftpSocket,args,this.userDetails,this.defaultPWD);
                                if(connectedUser && connectedUser.pwd)
                                originalPWD = connectedUser.pwd;
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
                                handleNlist(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type,makeItActive,auth,this.secureOptions);
                                command = null;
                                args = [];
                                break;
                            }
                            case "LIST":{
                                handleList(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type,makeItActive,auth,this.secureOptions);
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
                            case "XPWD":{
                                handlePwd(ftpSocket,args,connectedUser);
                                command = null;
                                args = [];
                                break;
                            }
                            case "CWD":{
                                handleCwd(ftpSocket,args,connectedUser,originalPWD);
                                command = null;
                                args = [];
                                break;
                            }
                            case "XCWD":{
                                handleCwd(ftpSocket,args,connectedUser,originalPWD);
                                command = null;
                                args = [];
                                break;
                            }
                            case "CDUP":{
                                handleCdup(ftpSocket,args,connectedUser,originalPWD);
                                command = null;
                                args = [];
                                break;
                            }
                            case "XCUP":{
                                handleCdup(ftpSocket,args,connectedUser,originalPWD);
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
                            case "RNFR":{
                                handleRnfr(ftpSocket,args,connectedUser);
                                command = null;
                                args = [];
                                break;
                            }
                            case "RNTO":{
                                handleRnto(ftpSocket,args,connectedUser);
                                command = null;
                                args = [];
                                break;
                            }
                            case "OPTS":{
                                ftpSocket.write("200 Always in UTF8 mode\r\n");
                                command = null;
                                args = [];
                                break;
                            }
                            case "SYST":{
                                ftpSocket.write(`215 ${process.platform} system type\r\n`);
                                command = null;
                                args = [];
                                break;
                            }
                            case "FEAT":{
                                ftpSocket.write("202 Command not implemented, superfluous at this site\r\n");
                                command = null;
                                args = [];
                                break;
                            }
                            case "STAT":{
                                ftpSocket.write(`211 OS : ${os.platform()} Version : ${os.version()} Arch : ${os.arch}\nEndianness : ${os.endianness()} FreeSpace : ${os.freemem()} Home : ${os.homedir()}\r\n`);
                                command = null;
                                args = [];
                                break;
                            }
                            case "TYPE":{
                                type = handleType(ftpSocket,args);
                                command = null;
                                args = [];
                                break;
                            }
                            case "PASV":{
                                passive = handlePasv(ftpSocket,args,this.passive);
                                command = null;
                                args = [];
                                break;
        
                            }
                            case "REIN":{
                                if(args.length){
                                    ftpSocket.write("500 Syntax error, command unrecognized\r\n");
                                    break;
                                }
                                connectedUser.pwd = originalPWD;
                                ftpSocket.write("220 Service ready for new user\r\n")
                                command = null;
                                args = [];
                                break;
                            }
                            case "STOR":{
                                handleStor(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type,makeItActive,auth,this.secureOptions);
                                command = null;
                                args = [];
                                break;
                            }
                            case "RETR":{
                                handleRetr(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type,makeItActive,auth,this.secureOptions);
                                command = null;
                                args = [];
                                break;
                            }
                            case "DELE":{
                                handleDele(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type);
                                command = null;
                                args = [];
                                break;
                            }
                            case "XDEL":{
                                handleDele(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type);
                                command = null;
                                args = [];
                                break;
                            }
                            case "ALLO":{
                                ftpSocket.write("202 Command not implemented, superfluous at this site\r\n");
                                command = null;
                                args = [];
                                break;
                            }
                            case "APPE":{
                                handleAppe(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type,makeItActive,auth,this.secureOptions);
                                command = null;
                                args = [];
                                break;
                            }
                            case "STOU":{
                                handleStou(ftpSocket,args,connectedUser,remoteAddress,remotePort,passive,this.passive,type,makeItActive,auth,this.secureOptions);
                                command = null;
                                args = [];
                                break;
                            }
                            case "QUIT":{
                                if(args.length){
                                    ftpSocket.write("500 Syntax error, command unrecognized\r\n");
                                    break;
                                }
                                emptyFiles(connectedUser);
                                connectedUser = null;
                                ftpSocket.end("221 Service closing control connection\r\n");
                                command = null;
                                args = [];
                                break;
                            }
                            case "AUTH":{
                                if(!args.length && args[0].toLowerCase() != 'tls'){
                                    ftpSocket.write("500 Syntax error, command unrecognized\r\n");
                                    break;
                                }
                                if(typeof this.secureOptions != 'object'){
                                    ftpSocket.write("421 Service not available\r\n");
                                    break;
                                }
                                if(!this.secureOptions.key || !this.secureOptions.cert){
                                    ftpSocket.write("421 Service not available\r\n");
                                    break;
                                }
                                ftpSocket.write("254 Initializing TLS Connection\r\n");
                                ftpSocket.removeAllListeners('data');
                                ftpSocket.removeAllListeners('error');
                                ftpSocket = new tls.TLSSocket(ftpSocket,{isServer:true,server:ftpServer,secureContext:tls.createSecureContext({
                                    key: this.secureOptions.key,
                                    cert: this.secureOptions.cert,
                                })})
                                auth = true;
                                ftpSocket.setEncoding('utf8');
                                ftpSocket.on("data",(data)=>{
                                    handleData.call(this,data)
                                })
                                ftpSocket.on("error",(error)=>{
                                    auth = false;
                                    console.log(error);
                                    ftpSocket.write("502 Command not implemented\r\n");
                                })
                                break;

                            }
                            default:{
                                ftpSocket.write("421 Service not available\r\n");
                            }
                        }
                    }
        
                    ftpSocket.on("data",(data)=>{
                        handleData.call(this,data)
                    })
        
                    ftpSocket.on("error",(error)=>{
                        console.log(error);
                        ftpSocket.write("502 Command not implemented\r\n");
                    })
        
                    ftpSocket.on("close",(error)=>{
                        if(error){
                            console.log("Socket had a transmission error")                    
                        }else{
                            console.log("Connection Closed.") ;
                        }
                        ftpSocket.write("502 Command not implemented\r\n");
                    })
                })
        
                ftpServer.listen(this.localPort,this.localAddress,()=>{
                    console.log(`Starting FTP Service at port ${this.localPort} with Passive : ${this.passive.active}`)
                }) 
                ftpServer.on("error",(err)=>{
                    console.log(err);
                })
            }
        }
        catch(err){
            console.log(err);
        }
    }
}


module.exports = FtpServer;