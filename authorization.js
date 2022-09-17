let users = null;
let connectionPassword = null;

function handleUser(ftpSocket,args,userDetails){
    if(!args.length){
        ftpSocket.end("501 Syntax error in parameters or argument\r\n");
    }
    let username = args[0];
    users = userDetails.map(value=>value.name);
    if(!userDetails.length){
        ftpSocket.write("230 User logged in, proceed\r\n");    
    }else{
        if(users.includes(username)){
            connectionPassword = userDetails[users.index(username)].password;
            ftpSocket.write("331 User name okay, need password\r\n");
        }else{
            ftpSocket.write("332 Need account for login\r\n");
            ftpSocket.end("530 Not logged in, Closing connection\r\n");
        }
    }
}

function handlePassword(ftpSocket,args,userDetails){
    if(!args.length){
        ftpSocket.end("501 Syntax error in parameters or argument\r\n");
    }
    let password = args[0];
    if(!userDetails.length){
        ftpSocket.write("230 User logged in, proceed\r\n");    
    }else{
        if(password == connectionPassword){
            ftpSocket.write("230 User logged in, proceed\r\n");
        }else{
            ftpSocket.end("530 Not logged in, Closing connection\r\n");
        }
    }
}

exports.handleUser = handleUser;
exports.handlePassword = handlePassword;