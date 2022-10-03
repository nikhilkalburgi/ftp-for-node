const net = require("net");
const tls = require("tls");
const fs = require("fs");
let dataServer = null;

files = {}

function emptyFiles(connectedUser){
    delete files[connectedUser.name];
}
function connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type,makeItActive,auth,secureOptions){

    try{
        if(!content){
        ftpSocket.write("450 Requested file action not taken\r\n");
        return;
     }
     if(!Array.isArray(content)){
        content = `${content.mode} ${content.uid} ${content.gid} ${content.size} ${content.mtimeMs} ${content.name}\n`;
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
     if(passive){
         if(passiveDetails.active){
             if(dataServer)dataServer.close();
             if(auth){
                 dataServer = tls.createServer(secureOptions,(sock)=>{
                     handleSocket(sock,dataServer)
                });
                 dataServer.on("error",(err)=>{
                    console.log(err);
                    ftpSocket.write("425 Can't open data connection\r\n");
                })
                
                dataServer.listen(passiveDetails.port);
            }else{
                    
                dataServer = net.createServer((sock)=>{
                    handleSocket(sock,dataServer)
                })
                    dataServer.on("error",(err)=>{
                        console.log(err);
                        ftpSocket.write("425 Can't open data connection\r\n");
                    })
                    dataServer.listen(passiveDetails.port);
                }
                function handleSocket(sock,dataServer){
                    makeItActive();
                    sock.write(content);
                    ftpSocket.write("226 Closing data connection\r\n");
                    sock.end();
                    dataServer.close();
                    dataServer = null;
                    sock.on("error",(err)=>{
                        console.log(err);
                        ftpSocket.write("425 Can't open data connection\r\n");
                    })
                }
            }else{
                ftpSocket.write("421 Service not available\r\n")
            }
        }else{
            let medium = null;
            if(auth){
                medium = tls.connect;
            }else{
                medium = net.createConnection;
            }
            let socket = medium({port:port,host:address,rejectUnauthorized:false},()=>{
                console.log(`Connected to ${address}:${port}`);
                socket.write(content);
                ftpSocket.write("226 Closing data connection\r\n");
                socket.end();
                
            })
            socket.on("error",(err)=>{
                console.log(err);
                ftpSocket.write("425 Can't open data connection\r\n");
            })
        }
        ftpSocket.write("150 File status okay; about to open data connection.\r\n");
    }
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }
    
}

function handleNlist(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type,makeItActive,auth,secureOptions){

    try{
        if(!(connectedUser.user + "nlist" in files)){
        files[connectedUser.name + "nlist"] = fs.readdirSync(connectedUser.pwd+'/');
    }
    let pathname = args.join(" ");
    if(!pathname){
        if(!connectedUser.pwd){
            ftpSocket.write("502 Command not implemented\r\n");    
        }else{
            connectToClient(ftpSocket,address,port,files[connectedUser.name + "nlist"],passive,passiveDetails,type,makeItActive,auth,secureOptions)
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
            connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type,makeItActive,auth,secureOptions);
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

function handleList(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type,makeItActive,auth,secureOptions){
    try{
        if(!(connectedUser.user+"list" in files)){
        files[connectedUser.name + "list"] = fs.readdirSync(connectedUser.pwd+'/');
        files[connectedUser.name + "nlist"] = files[connectedUser.name + "list"].slice();
        let fix = [];
        for(let v of files[connectedUser.name + "list"]){
            if(v != "System Volume Information" && v != ".git"){
                let stat = fs.statSync(connectedUser.pwd+'/'+v) 
                fix.push(`${stat.mode} ${stat.uid} ${stat.gid} ${stat.size} ${stat.mtimeMs} ${v}`)
            }
        }
        files[connectedUser.name + "list"] = fix.slice();
    }
    let pathname = args.join(" ");
    if(!pathname){
        if(!connectedUser.pwd){
            ftpSocket.write("502 Command not implemented\r\n");    
        }else{
            connectToClient(ftpSocket,address,port,files[connectedUser.name + "list"],passive,passiveDetails,type,makeItActive,auth,secureOptions)
        }
    }else{
        if(pathname.indexOf('/') == 0 ||pathname.indexOf('./') == 0 || pathname.indexOf('\\') == 0 || pathname.indexOf('.\\') == 0){
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
                let fix = [];
                for(let v of content){
                let stat = fs.statSync(connectedUser.pwd+'/'+pathname+'/'+v) 
                fix.push(`${stat.mode} ${stat.uid} ${stat.gid} ${stat.size} ${stat.mtimeMs} ${v}`)
                }
                content = fix.slice();
            }
            connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type,makeItActive,auth,secureOptions);
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