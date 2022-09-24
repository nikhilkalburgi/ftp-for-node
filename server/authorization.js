let users = null;
function handleUser(ftpSocket,args,userDetails,defaultPWD){
    if(!args.length){
        ftpSocket.end("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let username = args[0],connectedUser = null;
    users = userDetails.map(value=>value.name);
    if(!userDetails.length){
        connectedUser = {name:"ftp",pwd:defaultPWD};
        ftpSocket.write("230 User logged in, proceed\r\n");    
    }else{
        if(users.includes(username)){
            connectedUser = userDetails[users.indexOf(username)];
            ftpSocket.write("331 User name okay, need password\r\n");
        }else{
            ftpSocket.write("332 Need account for login\r\n");
            ftpSocket.end("530 Not logged in, Closing connection\r\n");
        }
    }
    return connectedUser;
}

function handlePassword(ftpSocket,args,connectedUser){
    if(!args.length){
        ftpSocket.end("501 Syntax error in parameters or argument\r\n");
        return;
    }
    let password = args[0];
    if(!connectedUser){
        ftpSocket.write("230 User logged in, proceed\r\n");    
    }else{
        if(password == connectedUser.password){
            ftpSocket.write("230 User logged in, proceed\r\n");
        }else{
            ftpSocket.end("530 Not logged in, Closing connection\r\n");
        }
    }
}

exports.handleUser = handleUser;
exports.handlePassword = handlePassword;