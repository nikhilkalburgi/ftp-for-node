const net = require("net");
const { EventEmitter } = require("stream");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const {addToQueue, connectPassive,isTransferCmd,isPassive,execNext} = require("./utilities.js");
let queue = [];

function handleData(data){
    let parsedData = data.toString().split(" ");
    this._statusCode = parsedData[0]
    this._statusMessage = parsedData.slice(1).join(" ");
    this._statusMessage.replace(/\r\n/g,"");
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
                if(queue.length)
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
            case "254":{
                this._auth.value = true;
                this._ControlChannel.removeAllListeners('data');
                this._ControlChannel.removeAllListeners('error');
                this._ControlChannel = tls.connect({socket:this._ControlChannel,rejectUnauthorized:false},()=>{
                    if(!isTransferCmd(queue[0])){
                        queue[0].callback(null,{status:"254",message:this._statusMessage});
                        queue.shift();
                        if(queue.length){
                            execNext(this.dataChannel,this._ControlChannel,this._passive,queue,this.localSite)
                        }
                    }
                })
                this._ControlChannel.setEncoding("utf8");
                this._ControlChannel.on("data",(data)=>{
                    handleData.call(this,data);
                })
                this._ControlChannel.on("error",(err)=>{
                    this.emit("connect",500,err);
                })
                break;
            }
            default:{
                this.emit("others",{status:this._statusCode,message:this._statusMessage})
            }           
        } 
}

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
        this._auth = {value:false}; 
        this.secureOptions = {};
    }

    checkUserInput(){
        if( typeof this.port != "number" || typeof this.address != "string" || typeof this._passive != "object" || typeof this.dataChannel != "object" || typeof this.localSite != "string" || typeof this._auth != "object" || typeof this.secureOptions != "object"){
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
        this.localSite = path.normalize(this.localSite.join(""));
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
                    handleData.call(this,data);
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
            callback("ERROR in Type",null);
            process.exit();
        }
        if(arg.split(",").length != 6){
            callback("ERROR is PORT Number",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`PORT ${arg}\r\n`,callback,keyword:"PORT",auth:this._auth},this.localSite)
        
    }
   

    LIST(arg,callback){
        if(typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        if(arg)
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`LIST ${arg}\r\n`,callback,keyword:"LIST",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
        else
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`LIST\r\n`,callback,keyword:"LIST",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
           
    }
    NLST(arg,callback){
        if(typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        if(arg)
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`NLST ${arg}\r\n`,callback,keyword:"NLST",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
        else
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`NLST\r\n`,callback,keyword:"NLST",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
    }

    RETR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RETR ${arg}\r\n`,callback,keyword:"RETR",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
        
    }
    STOR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        if(!fs.existsSync(path.normalize(this.localSite+arg))){
            callback("ERROR in Pathname",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`STOR ${arg}\r\n`,callback,keyword:"STOR",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
        
    }
    APPE(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        if(!fs.existsSync(path.normalize(this.localSite+arg))){
            callback("ERROR in Pathname",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`APPE ${arg}\r\n`,callback,keyword:"APPE",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
        
    }
    STOU(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        if(!fs.existsSync(path.normalize(this.localSite+arg))){
            callback("ERROR in Pathname",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`STOU ${arg}\r\n`,callback,keyword:"STOU",auth:this._auth,secureOptions:this.secureOptions},this.localSite);
        
    }
    DEL(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`DELE ${arg}\r\n`,callback,keyword:"DELE",auth:this._auth},this.localSite);
       
    }

    RMD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RMD ${arg}\r\n`,callback,keyword:"RMD",auth:this._auth},this.localSite);
     
    }
    PWD(callback){
        if(typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`PWD\r\n`,callback,keyword:"PWD",auth:this._auth},this.localSite);
    }
    CWD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`CWD ${arg}\r\n`,callback,keyword:"CWD",auth:this._auth},this.localSite);
    }
    MKD(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`MKD ${arg}\r\n`,callback,keyword:"MKD",auth:this._auth},this.localSite);
    }
    CDUP(callback){
        if(typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`CDUP\r\n`,callback,keyword:"CDUP",auth:this._auth},this.localSite);
    }
    RNFR(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RNFR ${arg}\r\n`,callback,keyword:"RNFR",auth:this._auth},this.localSite);
    }
    RNTO(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`RNTO ${arg}\r\n`,callback,keyword:"RNTO",auth:this._auth},this.localSite);
    }

    PASV(callback){
        if(typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`PASV\r\n`,callback,keyword:"PASV",auth:this._auth},this.localSite);
    }
    TYPE(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`TYPE ${arg}\r\n`,callback,keyword:"TYPE",auth:this._auth},this.localSite);
    }

    SYST(callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`SYST\r\n`,callback,keyword:"SYST",auth:this._auth},this.localSite);
    }
    STAT(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`STAT ${arg}\r\n`,callback,keyword:"STAT",auth:this._auth},this.localSite);
      
    }
    QUIT(callback){
        if(typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`QUIT\r\n`,callback,keyword:"QUIT",auth:this._auth},this.localSite);
    }

    AUTH(arg,callback){
        if(typeof arg != "string" || typeof callback != "function"){
            callback("ERROR in Type",null);
            process.exit();
        }
        if(arg.toLowerCase() != 'tls'){
            callback("ERROR in value "+arg,null);
            process.exit();
        }
        if(typeof this.secureOptions != "object"){
            callback("ERROR in sercureOptions",null);
            process.exit();
        }
        if(!this.secureOptions.key || !this.secureOptions.cert){
            callback("ERROR in sercureOptions",null);
            process.exit();
        }

        addToQueue(this.dataChannel,this._ControlChannel,this._passive,queue,{cmd:`AUTH ${arg}\r\n`,callback,keyword:"AUTH",auth:this._auth},this.localSite);
      
    }

}

module.exports = FtpClient;