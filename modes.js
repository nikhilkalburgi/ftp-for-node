function handleType(ftpSocket,args){

    try{
        if(args.length == 1 && !/(I|A)/g.test(args[0])){
            ftpSocket.end("501 Syntax error in parameters or argument\r\n");
            return;
        }
        ftpSocket.write("200 Command okay\r\n");
        return args[0];
    }
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }

}

function handlePasv(ftpSocket,args,passive){
    try{
        if(args.length){
            ftpSocket.end("501 Syntax error in parameters or argument\r\n");
            return false;
        }
        if(!passive.address || !passive.port || !passive.active){
            ftpSocket.write("421 Service not available\r\n");
            return false;
        }
        let [h1,h2,h3,h4] = passive.address.split('.');
        let p1 = parseInt(passive.port/256);
        let p2 = passive.port - p1*256;
        let mystr = `227 Entering Passive Mode (${h1},${h2},${h3},${h4},${p1},${p2})\r\n`;
        ftpSocket.write(mystr);
        return true;
    }
    catch(err){
        console.log(err);
        ftpSocket.write("502 Command not implemented\r\n");
    }
}

exports.handleType = handleType;
exports.handlePasv = handlePasv;