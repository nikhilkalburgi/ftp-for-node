const net = require("net");
const fs = require("fs");

files = {}

function emptyFiles(connectedUser){
    delete files[connectedUser.name];
}
function connectToClient(ftpSocket,address,port,content,passive){
    if(!content){
        ftpSocket.write("450 Requested file action not taken\r\n");
        return;
    }
    if(!Array.isArray(content)){
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
    if(!(connectedUser.user in files)){
        files[connectedUser.name] = fs.readdirSync(connectedUser.pwd);
    }
    let pathname = args[0];
    console.log(pathname,connectedUser,address,port);
    if(!pathname){
        if(!connectedUser.pwd){
            ftpSocket.write("502 Command not implemented\r\n");    
        }else{
            connectToClient(ftpSocket,address,port,files[connectedUser.name],false)
        }
    }else{
        pathname = pathname.replace("./","")
        if(files[connectedUser.name].includes(pathname)){
            let dirent = fs.statSync(`${connectedUser.pwd}/${pathname}`);
            let content;
            if(dirent.isFile()){
                content = fs.statSync(`${connectedUser.pwd}/${pathname}`);
                content.name = pathname;
            }else{
                content = fs.readdirSync(`${connectedUser.pwd}/${pathname}`);
            }
            connectToClient(ftpSocket,address,port,content,false);
        }else{
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        }
    }
}

function handleList(ftpSocket,args,connectedUser,address,port){
    if(!(connectedUser.user in files)){
        files[connectedUser.name] = fs.readdirSync(connectedUser.pwd);
        //Pending ...
    }
    let pathname = args[0];
    console.log(pathname,connectedUser,address,port);
    if(!pathname){
        if(!connectedUser.pwd){
            ftpSocket.write("502 Command not implemented\r\n");    
        }else{
            connectToClient(ftpSocket,address,port,files[connectedUser.name],false)
        }
    }else{
        pathname = pathname.replace("./","")
        if(files[connectedUser.name].includes(pathname)){
            let dirent = fs.statSync(`${connectedUser.pwd}/${pathname}`);
            let content;
            if(dirent.isFile()){
                content = fs.statSync(`${connectedUser.pwd}/${pathname}`);
                content.name = pathname;
            }else{
                content = fs.readdirSync(`${connectedUser.pwd}/${pathname}`);
                //Pending ...
            }
            connectToClient(ftpSocket,address,port,content,false);
        }else{
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        }
    }
}

exports.handleNlist = handleNlist;
exports.handleList = handleList;
exports.emptyFiles = emptyFiles;