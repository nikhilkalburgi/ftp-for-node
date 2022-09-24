const net = require("net");
const fs = require("fs");
const transferCmds = ["LIST","NLST","STOR","APPE","RETR","STOU"];
let server = null,client = null;
function addToQueue(dataChannel,channel,passive,queue,object,localSite){
    try{
       if(!queue.length){
            queue.push(object);
            execNext(dataChannel,channel,passive,queue,localSite);
       }else{
            queue.push(object);
       }
    }
    catch(err){
        console.log(err);
    }
}

function execNext(dataChannel,channel,passive,queue,localSite){
    if(isTransferCmd(queue[0])){
        if(isPassive(passive)){
            channel.write(queue[0].cmd);
        }else{
            server = net.createServer((socket)=>{
                if(queue[0].keyword != "LIST" && queue[0].keyword != "NLST"){
                    if(queue[0].keyword == "RETR")
                        queue[0].callback(null,socket);
                    else{
                        let pathname = queue[0].cmd.split(" ");
                        pathname = pathname.slice(1);
                        pathname = pathname.join(" ");
                        pathname = pathname.replace(/\r\n/g,"");
                        console.log(localSite)
                        fs.createReadStream(`${localSite}${pathname}`).pipe(socket);
                        queue[0].callback(null,{pathname,result:"success"});
                    }
                }
                socket.on("data",(data)=>{
                    if(queue[0].keyword == "LIST" || queue[0].keyword == "NLST"){
                        let body = data.toString().split("\n");
                        body.pop();
                        queue[0].callback(null,{status:"150",body:body})           
                    }
                })
                socket.on("end",()=>{
                    server.close();
                    queue.shift();
                    if(queue.length)
                    execNext(dataChannel,channel,passive,queue,localSite);
                })
                socket.on("error",(err)=>{
                    console.log(err);
                })
            })
            server.on("error",(err)=>{
                console.log(err);
            })
            server.listen(dataChannel.port,()=>{
                channel.write(queue[0].cmd);
            })
        }
    }else{
        channel.write(queue[0].cmd);
    }
}

function connectPassive(dataChannel,channel,passive,queue,localSite){
    client = net.createConnection({port:passive.port,host:passive.address},()=>{
        if(queue[0].keyword != "LIST" && queue[0].keyword != "NLST"){
            if(queue[0].keyword == "RETR")
                queue[0].callback(null,socket);
            else{
                let pathname = queue[0].cmd.split(" ");
                pathname = pathname.slice(1);
                pathname = pathname.join(" ");
                pathname = pathname.replace(/\r\n/g,"");
                console.log(localSite)
                fs.createReadStream(`${localSite}${pathname}`).pipe(socket);
                queue[0].callback(null,{pathname,result:"success"});
            }
        }
        client.on("data",(data)=>{
            let body = data.toString().split("\n");
            body.pop();
            queue[0].callback(null,{status:"150",body:body})          
        })
        
    })
    client.on("end",()=>{
        passive.active = false;
        passive.port = null;
        passive.address = null;
        queue.shift();
        if(queue.length)
        execNext(dataChannel,channel,passive,queue,localSite);
    })
    client.on("error",(err)=>{
            console.log(err);
    })
}

function isTransferCmd(q){
    if(transferCmds.includes(q.keyword))
        return true;
    return false;    
}

function isPassive(passive){
    return passive.active;
}

exports.addToQueue = addToQueue;
exports.connectPassive = connectPassive;
exports.isTransferCmd = isTransferCmd;
exports.isPassive = isPassive;
exports.execNext = execNext;