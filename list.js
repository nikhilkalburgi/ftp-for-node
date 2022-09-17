const net = require("net");
const fs = require("fs");

files = {}

function connectToClient(ftpSocket,address,port,content,passive){
    if(!content){
        ftpSocket.write("450 Requested file action not taken\r\n");
        return;
    }
    if(typeof content == "object"){
        content = `${content.name} ${content.size}\n`;
    }else{
        content = content.join("\n") + '\n';
    }
    if(!address && !port){
        console.error("Address or port in not correct.");
        ftpSocket.write("502 Command not implemented\r\n");
        return;
    }
    ftpSocket.write("150 File status okay; about to open data connection.\r\n");
    if(passive){

    }else{
            let socket = net.createConnection({port:port,host:address},()=>{
            console.log(`Connected to ${address}:${port}`);
            socket.write(content);
            ftpSocket.write("226 Closing data connection\r\n");
            socket.end();

            socket.on("error",(err)=>{
                console.log(err);
                ftpSocket.write("425 Can't open data connection\r\n");
            })
        })
    }
}

function handleNlist(ftpSocket,args,connectedUser,address,port){
    let pathname = args[0];
    console.log(pathname,connectedUser,address,port);
    if(!pathname){
        if(!connectedUser.pwd){
        ftpSocket.write("502 Command not implemented\r\n");    
        }else{
            if(!(connectedUser.user in files)){
                files[connectedUser.user] = fs.readdirSync(connectedUser.pwd);
            }
            connectToClient(ftpSocket,address,port,files[connectedUser.user],false)
        }
    }else{
        let dirent = fs.statSync(`${connectedUser.pwd}/${pathname}`);
        let content;
        if(dirent.isFile()){
            content = fs.statSync(`${connectedUser.pwd}/${pathname}`);
            content.name = pathname;
        }else{
            content = fs.readdirSync(`${connectedUser.pwd}/${pathname}`);
        }
        connectToClient(ftpSocket,address,port,content,false);
    }
}

exports.handleNlist = handleNlist;