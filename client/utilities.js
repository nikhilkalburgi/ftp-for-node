const net = require("net");
const fs = require("fs");
const path = require("path");
const tls = require("tls");
const transferCmds = ["LIST","NLST","STOR","APPE","RETR","STOU"];
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

function handleSocket(server,socket,dataChannel,channel,passive,queue,localSite){
    if(queue[0].keyword != "LIST" && queue[0].keyword != "NLST"){
        if(queue[0].keyword == "RETR")
            queue[0].callback(null,socket);
        else{
            let pathname = queue[0].cmd.split(" ");
            pathname = pathname.slice(1);
            pathname = pathname.join(" ");
            pathname = pathname.replace(/\r\n/g,"");
            fs.createReadStream(path.normalize(`${localSite}${pathname}`)).pipe(socket);
            queue[0].callback(null,{pathname,result:"success"});
        }
    }
    socket.setEncoding("utf8")
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
}

function execNext(dataChannel,channel,passive,queue,localSite){
    if(isTransferCmd(queue[0])){
        if(isPassive(passive)){
            channel.write(queue[0].cmd);
        }else{
            if(queue[0].auth.value){
                const server = tls.createServer(queue[0].secureOptions,(socket)=>{handleSocket(server,socket,dataChannel,channel,passive,queue,localSite)})
                server.on("error",(err)=>{
                    console.log(err);
                })
                server.listen(dataChannel.port,()=>{
                    channel.write(queue[0].cmd);
                })
            }else{
                const server = net.createServer((socket)=>{handleSocket(server,socket,dataChannel,channel,passive,queue,localSite)})
                server.on("error",(err)=>{
                    console.log(err);
                })
                server.listen(dataChannel.port,()=>{
                    channel.write(queue[0].cmd);
                })
            }
        }
    }else{
        channel.write(queue[0].cmd);
    }
}

function connectPassive(dataChannel,channel,passive,queue,localSite){
    let medium = net.createConnection;
    if(queue[0].auth.value){
        medium = tls.connect;
    }
    let client = medium({port:passive.port,host:passive.address,rejectUnauthorized:false},()=>{
        if(queue[0].keyword != "LIST" && queue[0].keyword != "NLST"){
            if(queue[0].keyword == "RETR")
                queue[0].callback(null,client);
            else{
                let pathname = queue[0].cmd.split(" ");
                pathname = pathname.slice(1);
                pathname = pathname.join(" ");
                pathname = pathname.replace(/\r\n/g,"");
                fs.createReadStream(path.normalize(`${localSite}${pathname}`)).pipe(client);
                queue[0].callback(null,{pathname,result:"success"});
            }
        }
        client.setEncoding("utf8");
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
    if(q)
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