const net = require("net");
const { EventEmitter } = require("stream");
const fs = require("fs");
const {addToQueue} = require("./dataConnection.js");
let _currentCmd = null;
class FtpClient extends EventEmitter{
    constructor(){
        super();
        this.port = 21;
        this.address = "localhost";
        this.dataChannel = {
            address : null,
            port : null
        };
        this.user = null;
        this.password = null;
        this._ControlChannel = null;
        this._passive = {
            active : false,
            address : null,
            port : null
        };
        this._currentCmd = [];
        this._statusCode = [];
        this._statusMessage = [];
        
    }

    connect(){
        try{
            this._ControlChannel = net.createConnection({
                host : this.address,
                port : this.port,
            });
            this._ControlChannel.on("data",(data)=>{
                let parsedData = data.toString().split("\r\n");
                parsedData.pop();
                for(let value of parsedData){
                    this._statusCode.push(value.split(" ")[0]);
                    this._statusMessage.push(value.split(" ").slice(1).join(" "));
                }
                console.log(this._statusCode,this._statusMessage);
                while(this._statusCode.length){
                    _currentCmd = this._currentCmd.shift();
                    switch(this._statusCode.shift()){
                        case "220":{
                            this._currentCmd.push("user");
                            this._ControlChannel.write(`USER ${this.user}\r\n`);
                            this._statusMessage.shift();
                            break;
                        }
                        case "331":{
                            this._currentCmd.push("pass");
                            this._ControlChannel.write(`PASS ${this.password}\r\n`);
                            break;
                        }
                        case "230":{
                            this.emit("ready",230,this._statusMessage.shift());
                            break;
                        }
                        case "200":{
                            this.emit(`_${_currentCmd}`,null,{status:200,message:this._statusMessage.shift()});
                            break;
                        }
                        case "250":{
                            this.emit(`_${_currentCmd}`,null,{status:250,message:this._statusMessage.shift()});
                            break;                    
                        }
                        case "257":{
                            this.emit(`_${_currentCmd}`,null,{status:257,message:this._statusMessage.shift()});
                            break;
                        }
                        case "227":{
                            let temp = this._statusMessage[0].split(",");
                            temp[0] = temp[0].split("(")[1].trim();
                            temp[1] = temp[1].trim();
                            temp[2] = temp[2].trim();
                            temp[3] = temp[3].trim();
                            temp[4] = temp[4].trim();
                            temp[5] = temp[5].split(")")[1].trim();
                            this._passive.active = true;
                            this._passive.address = temp.slice(0,3).join(".");
                            this._passive.port = parseInt(temp[4]*256 + temp[5]);
                            this.emit(`_${_currentCmd}`,null,{status:227,message:this._statusMessage.shift()});
                            break;
                        }
                        case "500":{
                            this.emit(`_${_currentCmd}`,{status:500,message:this._statusMessage.shift()},null);
                            break;
                        }
                        case "502":{
                            this.emit(`_${_currentCmd}`,{status:502,message:this._statusMessage.shift()},null);
                            break;
                        }
                        case "501":{
                            this.emit(`_${_currentCmd}`,{status:501,message:this._statusMessage.shift()},null);
                            break;
                        }
                        case "450":{
                            this.emit(`_${_currentCmd}`,{status:450,message:this._statusMessage.shift()},null);
                            break;
                        }
                        case "425":{
                            this.emit(`_${_currentCmd}`,{status:425,message:this._statusMessage.shift()},null);
                            break;
                        }
                        default:{
                            this._statusMessage.shift();
                        }
        
                    } 
    
                }
                
            })

        }
        catch(err){
            console.log(err);
        }
    }
    PORT(arg,callback){
        if(typeof arg != "string"|| typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        if(arg.split(",").length != 6){
            callback("ERROR",null);
            process.exit();
        }

        let tempFunc = (err,msg)=>{
            this.off("_port",tempFunc);
            callback(err,msg)
        }
        this.on("_port",tempFunc);
        this._currentCmd.push("port");
        this._ControlChannel.write(`PORT ${arg}\r\n`);
    }
   

    LIST(arg,callback){
        if(typeof arg != "string"|| typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }

        let tempFunc = (err,msg)=>{
            this.off("_list",tempFunc);
            callback(err,msg)
        }
        this.on("_list",tempFunc);
        addToQueue(this._ControlChannel,`LIST ${arg}\r\n`,callback,this._passive); 
        this._currentCmd.push("list");      
    }
    NLST(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            this.off("_nlst",tempFunc);
            callback(err,msg)
        }
        this.on("_nlst",tempFunc);
        addToQueue(this._ControlChannel,`NLST ${arg}\r\n`,callback,this._passive);
        this._currentCmd.push("nlst");
    }

    RETR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_retr",tempFunc);
        }
        this.on("_retr",tempFunc);
        addToQueue(this._ControlChannel,`RETR ${arg}\r\n`,callback,this._passive);
        this._currentCmd.push("retr");
    }
    STOR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        if(!fs.existsSync(arg)){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_stor",tempFunc);
        }
        this.on("_stor",tempFunc);
        arg.replace(/\\/g,"/")
        let temp = arg.split("/");
        temp = temp[temp.length-1];
        console.log(arg,temp)
        addToQueue(this._ControlChannel,`STOR ${temp}\r\n`,callback,this._passive,arg);
        this._currentCmd.push("stor");
    }
    APPE(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        if(!fs.existsSync(arg)){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_appe",tempFunc);
        }
        this.on("_appe",tempFunc);
        arg.replace(/\\/g,"/")
        let temp = arg.split("/");
        temp = temp[temp.length-1];
        addToQueue(this._ControlChannel,`APPE ${temp}\r\n`,callback,this._passive,arg);
        this._currentCmd.push("appe");
    }
    STOU(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        if(!fs.existsSync(arg)){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_stou",tempFunc);
        }
        this.on("_stou",tempFunc);
        arg.replace(/\\/g,"/")
        let temp = arg.split("/");
        temp = temp[temp.length-1];
        addToQueue(this._ControlChannel,`STOU ${temp}\r\n`,callback,this._passive,arg);
        this._currentCmd.push("stou");
    }
    DEL(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_dele",tempFunc);
        }
        this.on("_dele",tempFunc);
        this._currentCmd.push("dele");
        this._ControlChannel.write(`DELE ${arg}`);
    }

    RMD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_rmd",tempFunc);
        }
        this.on("_rmd",tempFunc);
        this._currentCmd.push("rmd");
        this._ControlChannel.write(`RMD ${arg}`);
    }
    PWD(callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_pwd",tempFunc);
        }
        this.on("_pwd",tempFunc);
        this._currentCmd.push("pwd");
        this._ControlChannel.write(`PWD\r\n`);
    }
    CWD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_cwd",tempFunc);
        }
        this.on("_cwd",tempFunc);
        this._currentCmd.push("cwd");
        this._ControlChannel.write(`CWD ${arg}\r\n`);
    }
    MKD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_mkd",tempFunc);
        }
        this.on("_mkd",tempFunc);
        this._currentCmd.push("mkd");
        this._ControlChannel.write(`MKD ${arg}\r\n`);
    }
    CDUP(callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_cdup",tempFunc);
        }
        this.on("_cdup",tempFunc);
        this._currentCmd.push("cdup");
        this._ControlChannel.write(`CDUP\r\n`);
    }
    RNFR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_rnfr",tempFunc);
        }
        this.on("_rnfr",tempFunc);
        this._currentCmd.push("rnfr");
        this._ControlChannel.write(`RNFR ${arg}\r\n`);
    }
    RNTO(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_rnto",tempFunc);
        }
        this.on("_rnto",tempFunc);
        this._currentCmd.push("rnto");
        this._ControlChannel.write(`RNTO ${arg}\r\n`);
    }

    PASV(callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_pasv",tempFunc);
        }
        this.on("_pasv",tempFunc);
        this._currentCmd.push("pasv");
        this._ControlChannel.write(`PASV\r\n`);
    }
    TYPE(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_type",tempFunc);
        }
        this.on("_type",tempFunc);
        this._ControlChannel.write(`TYPE ${arg}\r\n`);
        this._currentCmd.push("type");
    }

    SYST(callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_syst",tempFunc);
        }
        this.on("_syst",tempFunc);
        this._ControlChannel.write(`SYST\r\n`);
        this._currentCmd.push("syst");
    }
    STAT(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        let tempFunc = (err,msg)=>{
            callback(err,msg)
            this.off("_stat",tempFunc);
        }
        this.on("_stat",tempFunc);
        this._ControlChannel.write(`STAT ${arg}\r\n`);
        this._currentCmd.push("stat");
    }
    ACTIVE(){
        this._passive.active = false;
    }


}

const c = new FtpClient();
c.on("ready",(code,m)=>{
    c.PORT("127,0,0,1,11,184",(err,res)=>{
        console.log("port"+res);
    })
    c.PWD((err,msg)=>{
        console.log("pwd"+msg)
    })
    c.NLST("folder name",(err,list)=>{
        console.log(err,list)
    })
    c.RETR("app.html",(err,socket)=>{
        console.log(err,socket);
    })
    c.APPE("E:/project/ftp-for-node/client/abc.js",(err,socket)=>{
        console.log(err,socket);
    })

})
c.connect();