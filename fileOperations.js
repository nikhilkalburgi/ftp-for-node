const fs = require("fs");
const net = require("net");
function connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type,retr=false){
    try{
        if(!content){
            ftpSocket.write("450 Requested file action not taken\r\n");
            return;
        }
    
        if(!address && !port){
            console.error("Address or port in not correct.");
            ftpSocket.write("502 Command not implemented\r\n");
            return;
        }
        ftpSocket.write("150 File status okay; about to open data connection.\r\n");
        if(passive){
            if(passiveDetails.active){
                const dataServer = net.createServer((sock)=>{
                    sock.setEncoding((type == 'A')?"utf8":null);
                    if(retr){
                        content.pipe(sock);
                    }else{
                        sock.pipe(content);
                    }
                    ftpSocket.write("226 Closing data connection\r\n");
                    sock.on("error",(err)=>{
                        console.log(err);
                        ftpSocket.write("425 Can't open data connection\r\n");
                    })
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
                if(retr){
                    content.pipe(socket);
                }else{
                    socket.pipe(content);
                }
                ftpSocket.write("226 Closing data connection\r\n");
    
                socket.on("error",(err)=>{
                    console.log(err);
                    ftpSocket.write("425 Can't open data connection\r\n");
                })
            })
            socket.setEncoding((type == 'A')?"utf8":null);
        }
    }
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }
}

function handleStor(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    if(!args.length){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let pathname = args.join(" ");
    if(pathname.indexOf('/') == 0 ||pathname.indexOf('./') == 0 || pathname.indexOf('\\') == 0 || pathname.indexOf('.\\') == 0){
        pathname = pathname.replace("./","")
        pathname = pathname.replace("/","")
        pathname = pathname.replace(".\\","")
        pathname = pathname.replace("\\","")
    }
    if(/[/\\]/g.test(pathname)){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let content = fs.createWriteStream(`${connectedUser.pwd}/${pathname}`);
    content.on("error",(err)=>{
        console.log(err)
        ftpSocket.write("502 Command not implemented\r\n");
    })
    connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type);

}

function handleRetr(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    try{


        if(!args.length){
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
        }
        let pathname = args.join(" "),content;
        if(pathname.indexOf('/') == 0 ||pathname.indexOf('./') == 0 || pathname.indexOf('\\') == 0 || pathname.indexOf('.\\') == 0){
            pathname = pathname.replace("./","")
            pathname = pathname.replace("/","")
            pathname = pathname.replace(".\\","")
            pathname = pathname.replace("\\","")
        }
        if(/[/\\]/g.test(pathname)){
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
        }
        if(fs.existsSync(`${connectedUser.pwd}/${pathname}`)){
            content = fs.createReadStream(`${connectedUser.pwd}/${pathname}`);
            content.on("error",(err)=>{
                console.log(err)
                ftpSocket.write("502 Command not implemented\r\n");
            })
        }else{
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
        }
        connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type,true);
    }
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }
}

function handleDele(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    if(!args.length){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let pathname = args.join(" ");
    if(pathname.indexOf('/') == 0 ||pathname.indexOf('./') == 0 || pathname.indexOf('\\') == 0 || pathname.indexOf('.\\') == 0){
        pathname = pathname.replace("./","")
        pathname = pathname.replace("/","")
        pathname = pathname.replace(".\\","")
        pathname = pathname.replace("\\","")
    }
    if(/[/\\]/g.test(pathname)){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    if(fs.existsSync(`${connectedUser.pwd}/${pathname}`)){
         fs.rm(`${connectedUser.pwd}/${pathname}`);
         ftpSocket.write("250 Requested file action okay, completed\r\n")
    }else{
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    
}

function handleAppe(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    if(!args.length){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let pathname = args.join(" ");
    if(pathname.indexOf('/') == 0 ||pathname.indexOf('./') == 0 || pathname.indexOf('\\') == 0 || pathname.indexOf('.\\') == 0){
        pathname = pathname.replace("./","")
        pathname = pathname.replace("/","")
        pathname = pathname.replace(".\\","")
        pathname = pathname.replace("\\","")
    }
    if(/[/\\]/g.test(pathname)){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let content = fs.createWriteStream(`${connectedUser.pwd}/${pathname}`,{flags:'as+'});
    content.on("error",(err)=>{
        console.log(err)
        ftpSocket.write("502 Command not implemented\r\n");
    })
    connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type);
}

exports.handleStor = handleStor;
exports.handleRetr = handleRetr;
exports.handleDele = handleDele;
exports.handleAppe = handleAppe;