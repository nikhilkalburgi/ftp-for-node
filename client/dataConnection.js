const net = require("net");
const fs = require("fs");
let server = null;
let client = null;
let queue = [];
function addToQueue(channel,cmd,callback,passive,pathname){
    try{
        queue.push({cmd:cmd,callback:callback,pathname:pathname});
        if(passive.active){
            client = net.createConnection({port:passive.port,host:passive.address},()=>{
                let popItem = queue.shift();
                    if(popItem.cmd.slice(0,4) != "NLST" && popItem.cmd.slice(0,4) != "LIST"){
                        if(popItem.cmd.slice(0,4) == "RETR"){
                            popItem.callback(null,client);
                        }else{
                            fs.createReadStream(popItem.pathname).pipe(client);
                            popItem.callback(null,`Success ${popItem.cmd.slice(0,4)}`)
                        }
                    }
                    client.on("data",(data)=>{
                        if(popItem.cmd.slice(0,4) == "LIST" || popItem.cmd.slice(0,4) == "NLST"){
                            let body = data.toString().split("\n");
                            body.pop();
                            popItem.callback(null,body);
                        }
                    })
                    
                    client.on("end",()=>{
                        client.unpipe()
                        console.log("Ended...")
                        if(!queue.length){
                            server.close();
                            server = null
                        }
                        else{
                            if(queue[0].cmd != undefined)
                                channel.write(queue[0].cmd);
                        }
                    })

                    client.on("error",()=>{
                        popItem.callback(err,null);
                    })
            })
        }else{
    
            if(!server){
                server = net.createServer((sock)=>{
                    let popItem = queue.shift();
                    if(popItem.cmd.slice(0,4) != "NLST" && popItem.cmd.slice(0,4) != "LIST"){
                        if(popItem.cmd.slice(0,4) == "RETR"){
                            popItem.callback(null,sock);
                        }else{
                            fs.createReadStream(popItem.pathname).pipe(sock);
                            popItem.callback(null,`Success ${popItem.cmd.slice(0,4)}`)
                        }
                    }
                    sock.on("data",(data)=>{
                        if(popItem.cmd.slice(0,4) == "LIST" || popItem.cmd.slice(0,4) == "NLST"){
                            let body = data.toString().split("\n");
                            body.pop();
                            popItem.callback(null,body);
    
                        }
        
                    })
                    
                    sock.on("end",()=>{
                        sock.unpipe()
                        if(!queue.length){
                            server.close();
                            server = null
                        }
                        else{
                            if(queue[0].cmd != undefined)
                                channel.write(queue[0].cmd);
                        }
                    })
                })
                server.on("error",(err)=>{
                    popItem.callback(err,null);
                })
                server.listen(3000,()=>{
                    console.log("listening...")
                    if(queue[0].cmd != undefined)
                    channel.write(queue[0].cmd);
                });
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

exports.addToQueue = addToQueue;