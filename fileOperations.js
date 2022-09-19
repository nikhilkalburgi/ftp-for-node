function connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type,retr=false){
    if(!content){
        ftpSocket.write("450 Requested file action not taken\r\n");
        return;
    }

    if(type == 'I'){
        content = Buffer.from(content,'ascii');
    }

    if(!address && !port){
        console.error("Address or port in not correct.");
        ftpSocket.write("502 Command not implemented\r\n");
        return;
    }
    ftpSocket.write("150 File status okay; about to open data connection.\r\n");
    if(passive){
        if(passiveDetails.active){
            const dataServer = fs.createServer((sock)=>{
                sock.setEncoding((type == 'A')?"utf8":null);
                if(retr){
                    sock.write(content);
                    ftpSocket.write("226 Closing data connection\r\n");
                    sock.end();
                }
                sock.on("data",(data)=>{
                    
                })
                sock.on("end",()=>{
                    ftpSocket.write("226 Closing data connection\r\n");
                })
            })
            dataServer.listen(passiveDetails.port);
        }else{
            ftpSocket.write("421 Service not available\r\n")
        }
    }else{
            let socket = net.createConnection({port:port,host:address},()=>{
            console.log(`Connected to ${address}:${port}`);
            if(retr){
                socket.write(content);
                ftpSocket.write("226 Closing data connection\r\n");
                socket.end();
            }
            socket.on("data",(data)=>{

            })
            socket.on("end",()=>{
                ftpSocket.write("226 Closing data connection\r\n");
            })

            socket.on("error",(err)=>{
                console.log(err);
                ftpSocket.write("425 Can't open data connection\r\n");
            })
        })
        socket.setEncoding((type == 'A')?"utf8":null);
    }
}

function handleStor(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    if(!args.length){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let pathname = args.join(" ");

    connectToClient(ftpSocket,address,port,null,passive,passiveDetails,type);

}

function handleRetr(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    if(!args.length){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let pathname = args.join(" "),content;
    if(fs.exitsSync(pathname)){
        content = fs.readFileSync(pathname,{encoding:"utf8"});
    }else{
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }
    connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type,retr);
}

function handleDele(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    if(!args.length){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }

    connectToClient(ftpSocket,address,port,null,passive,passiveDetails,type);
}

function handleAppe(ftpSocket,args,connectedUser,address,port,passive,passiveDetails,type){
    if(!args.length){
        ftpSocket.write("501 Syntax error in parameters or argument\r\n");
        return;
    }

    connectToClient(ftpSocket,address,port,content,passive,passiveDetails,type);
}

exports.handleStor = handleStor;
exports.handleRetr = handleRetr;
exports.handleDele = handleDele;
exports.handleAppe = handleAppe;