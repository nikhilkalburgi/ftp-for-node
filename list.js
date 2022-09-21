const net = require("net");
const fs = require("fs");

files = {}

function emptyFiles(connectedUser){
    delete files[connectedUser.name];
}
function connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type){

    try{
        if(!content){
        ftpSocket.write("450 Requested file action not taken\r\n");
        return;
     }
     if(!Array.isArray(content)){
        content = `${content.name} ${content.size}\n`;
     }else{
        content = content.join("\n") + '\n';
     }
     if(type == 'I'){
        content = Buffer.from(content,'ascii');
     }
     if(!address && !port && !passive){
        console.error("Address or port in not correct.");
        ftpSocket.write("502 Command not implemented\r\n");
        return;
     }
     ftpSocket.write("150 File status okay; about to open data connection.\r\n");
     if(passive){
        if(passiveDetails.active){
            const dataServer = net.createServer((sock)=>{
                sock.write(content);
                ftpSocket.write("226 Closing data connection\r\n");
                sock.end();
                sock.on("error",(err)=>{
                    console.log(err);
                    ftpSocket.write("425 Can't open data connection\r\n");
                })
                dataServer.close();
            })
            dataServer.on("error",(err)=>{
                console.log(err);
                ftpSocket.write("425 Can't open data connection\r\n");
            })
            dataServer.listen(passiveDetails.port);
        }else{
            ftpSocket.write("421 Service not available\r\n")
        }
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
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }
    
}

function handleNlist(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){

    try{
        if(!(connectedUser.user + "nlist" in files)){
        files[connectedUser.name + "nlist"] = fs.readdirSync(connectedUser.pwd+'/');
    }
    let pathname = args[0];
    if(!pathname){
        if(!connectedUser.pwd){
            ftpSocket.write("502 Command not implemented\r\n");    
        }else{
            connectToClient(ftpSocket,address,port,files[connectedUser.name + "nlist"],passive,passiveDetails,type)
        }
    }else{
        if(pathname.indexOf('/') == 0 || pathname.indexOf('./') == 0 || pathname.indexOf('\\') == 0 || pathname.indexOf('.\\') == 0){
            pathname = pathname.replace("./","")
            pathname = pathname.replace("/","")
            pathname = pathname.replace(".\\","")
            pathname = pathname.replace("\\","")
        }
        if(files[connectedUser.name + "nlist"].includes(pathname)){
            let dirent = fs.statSync(`${connectedUser.pwd}/${pathname}`);
            let content;
            if(dirent.isFile()){
                content = fs.statSync(`${connectedUser.pwd}/${pathname}`);
                content.name = pathname;
            }else{
                content = fs.readdirSync(`${connectedUser.pwd}/${pathname}`);
            }
            connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type);
        }else{
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        }
    }
    }
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }
    
}

function handleList(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    try{
        if(!(connectedUser.user+"list" in files)){
        files[connectedUser.name + "list"] = fs.readdirSync(connectedUser.pwd+'/');
        let fix = [];
        for(let v of files[connectedUser.name + "list"]){
            if(v != "System Volume Information" && v != ".git"){
                let stat = fs.statSync(connectedUser.pwd+'/'+v) 
                fix.push(`${stat.mode} ${stat.uid} ${stat.gid} ${stat.size} ${stat.mtimeMs} ${v}`)
            }
        }
        files[connectedUser.name + "list"] = fix.slice();
    }
    let pathname = args[0];
    if(!pathname){
        if(!connectedUser.pwd){
            ftpSocket.write("502 Command not implemented\r\n");    
        }else{
            connectToClient(ftpSocket,address,port,files[connectedUser.name + "list"],passive,passiveDetails,type)
        }
    }else{
        if(pathname.indexOf('/') == 0 ||pathname.indexOf('./') == 0 || pathname.indexOf('\\') == 0 || pathname.indexOf('.\\') == 0){
            pathname = pathname.replace("./","")
            pathname = pathname.replace("/","")
            pathname = pathname.replace(".\\","")
            pathname = pathname.replace("\\","")
        }
        if(files[connectedUser.name + "list"].includes(pathname)){
            let dirent = fs.statSync(`${connectedUser.pwd}/${pathname}`);
            let content;
            if(dirent.isFile()){
                content = fs.statSync(`${connectedUser.pwd}/${pathname}`);
                content.name = pathname;
            }else{
                content = fs.readdirSync(`${connectedUser.pwd}/${pathname}`);
                let fix = [];
                for(let v of content){
                let stat = fs.statSync(connectedUser.pwd+'/'+v) 
                fix.push(`${stat.mode} ${stat.uid} ${stat.gid} ${stat.size} ${stat.mtimeMs} ${v}`)
                }
                content = fix.slice();
            }
            connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type);
        }else{
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        }
    }
    }
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }
    
}

exports.handleNlist = handleNlist;
exports.handleList = handleList;
exports.emptyFiles = emptyFiles;