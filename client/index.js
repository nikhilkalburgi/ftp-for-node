const net = require("net");
const { EventEmitter } = require("stream");
const fs = require("fs");
const {addToQueue, connectPassive,isTransferCmd,isPassive,execNext} = require("./utilities.js");
let queue = [];
class FtpClient extends EventEmitter{
    constructor(){
        super();
        this.port = 21;
        this.address = "localhost";
        this.dataChannel = {
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
        this._statusCode = null;
        this._statusMessage = null;  
        this.localSite = null; 
    }

    checkUserInput(){
        if( typeof this.port != "number" || typeof this.address != "string" || typeof this._passive != "object" || typeof this.dataChannel != "object" || typeof this.localSite != "string"){
            console.log("Error : Invalid Type");
            return false;
        }
        if(typeof this._passive.active != "boolean" || typeof this.dataChannel.port != "number"){
            console.log("Error : Invalid Type");
            return false;
        }   
        this.localSite = this.localSite.replace(/\\/g,"/");
        this.localSite = this.localSite.split("");
        if(this.localSite[this.localSite.length-1] != "/"){
            this.localSite.push("/");
        }   
        this.localSite = this.localSite.join("");
        console.log(this.localSite);
        return true;
    }

    connect(){
        try{

            if(this.checkUserInput()){

                this._ControlChannel = net.createConnection({
                    host : this.address,
                    port : this.port,
                });
                this._ControlChannel.on("data",(data)=>{
                    let parsedData = data.toString().split(" ");
                    this._statusCode = parsedData[0]
                    this._statusMessage = parsedData.slice(1).join(" ");
                    this._statusMessage.replace(/\r\n/g,"");
                    console.log(this._statusCode,this._statusMessage)
                        switch(this._statusCode){
                            case "220":{
                                this._ControlChannel.write(`USER ${this.user}\r\n`);
                                break;
                            }
                            case "331":{
                                this._ControlChannel.write(`PASS ${this.password}\r\n`);
                                break;
                            }
                            case "230":{
                                this.emit("connect",230,this._statusMessage);
                                break;
                            }
                            case "221":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"221",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "200":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"200",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "150":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"150",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }else{
                                    if(isPassive(this._passive)){
                                        connectPassive(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "250":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"250",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;                    
                            }
                            case "257":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"257",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "227":{
                                let temp = this._statusMessage.split(",");
                                temp[0] = temp[0].split("(")[1].trim();
                                temp[1] = temp[1].trim();
                                temp[2] = temp[2].trim();
                                temp[3] = temp[3].trim();
                                temp[4] = temp[4].trim();
                                temp[5] = temp[5].split(")")[0].trim();
                                this._passive.active = true;
                                this._passive.address = temp.slice(0,4).join(".");
                                this._passive.port = parseInt(parseInt(temp[4]*256) + parseInt(temp[5]));
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"227",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite);
                                    }
                                }
                                break;
                            }
                            case "500":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"500",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "502":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"502",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "501":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"501",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "450":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"450",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "425":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"425",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            case "421":{
                                if(!isTransferCmd(queue[0])){
                                    queue[0].callback(null,{status:"421",message:this._statusMessage});
                                    queue.shift();
                                    if(queue.length){
                                        execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                                    }
                                }
                                break;
                            }
                            default:{
                                this.emit("others",{status:this._statusCode,message:this._statusMessage})
                            }           
                        } 
                })
                this._ControlChannel.on("error",(err)=>{
                    this.emit("connect",500,err);
                })
            }
        }
        catch(err){
            console.log(err);
        }
    }
    PORT(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        if(arg.split(",").length != 6){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`PORT ${arg}\r\n`,callback,keyword:"PORT"},this.localSite)
        
    }
   

    LIST(arg,callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        if(arg)
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`LIST ${arg}\r\n`,callback,keyword:"LIST"},this.localSite);
        else
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`LIST\r\n`,callback,keyword:"LIST"},this.localSite);
           
    }
    NLST(arg,callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        if(arg)
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`NLST ${arg}\r\n`,callback,keyword:"NLST"},this.localSite);
        else
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`NLST\r\n`,callback,keyword:"NLST"},this.localSite);
    }

    RETR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RETR ${arg}\r\n`,callback,keyword:"RETR"},this.localSite);
        
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
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`STOR ${arg}\r\n`,callback,keyword:"STOR"},this.localSite);
        
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
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`APPE ${arg}\r\n`,callback,keyword:"APPE"},this.localSite);
        
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
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`STOU ${arg}\r\n`,callback,keyword:"STOU"},this.localSite);
        
    }
    DEL(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`DELE ${arg}\r\n`,callback,keyword:"DELE"},this.localSite);
       
    }

    RMD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RMD ${arg}\r\n`,callback,keyword:"RMD"},this.localSite);
     
    }
    PWD(callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`PWD\r\n`,callback,keyword:"PWD"},this.localSite);
    }
    CWD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`CWD ${arg}\r\n`,callback,keyword:"CWD"},this.localSite);
    }
    MKD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`MKD ${arg}\r\n`,callback,keyword:"MKD"},this.localSite);
    }
    CDUP(callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`CDUP\r\n`,callback,keyword:"CDUP"},this.localSite);
    }
    RNFR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RNFR ${arg}\r\n`,callback,keyword:"RNFR"},this.localSite);
    }
    RNTO(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RNTO ${arg}\r\n`,callback,keyword:"RNTO"},this.localSite);
    }

    PASV(callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`PASV\r\n`,callback,keyword:"PASV"},this.localSite);
    }
    TYPE(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`TYPE ${arg}\r\n`,callback,keyword:"TYPE"},this.localSite);
    }

    SYST(callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`SYST\r\n`,callback,keyword:"SYST"},this.localSite);
    }
    STAT(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`STAT ${arg}\r\n`,callback,keyword:"STAT"},this.localSite);
      
    }
    QUIT(callback){
        if(typeof callback != "function"){
            callback("ERROR",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`QUIT\r\n`,callback,keyword:"QUIT"},this.localSite);
    }


}

module.exports = FtpClient;