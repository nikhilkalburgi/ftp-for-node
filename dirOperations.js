var fs = require("fs");
function handlePwd(ftpSocket,args,connectedUser){
   if(args.length){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
 if(!connectedUser.pwd){
    ftpSocket.write("550 Requested action not taken\r\n");
 }else{
   if(fs.existsSync(connectedUser.pwd))
    ftpSocket.write('257 "'+connectedUser.pwd+'"\r\n');
    else
    ftpSocket.write("550 Requested action not taken\r\n");
 }
}

function handleCwd(ftpSocket,args,connectedUser){
   if(!args.length){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
   if(fs.existsSync(args[0])){
      args[0] = args[0].replace("\\","/");
      args[0] = args[0].replace("\\\\","//");
      args[0] = args[0].split("");
      if(args[0][args[0].length-1] == '/' || args[0][args[0].length-1] == '\\')
         args[0].pop();
         if(args[0][args[0].length-2] == '/' || args[0][args[0].length-2] == '\\')
         args[0].pop();   
      args[0] = args[0].join("");
      connectedUser.pwd = args[0];
      ftpSocket.write("250 Requested file action okay, completed\r\n");
   }else{
      ftpSocket.write("550 Requested action not taken\r\n");
   }

}

function handleMkd(ftpSocket,args,connectedUser){
   if(!args.length || /[<>\/\\:\|*?]/g.test(args[0])){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
   fs.mkdirSync(`${connectedUser.pwd}/${args[0]}`);
   ftpSocket.write('257 "'+`${connectedUser.pwd}/${args[0]}`+'" created\r\n')
}

function handleRmd(ftpSocket,args,connectedUser){
   if(!args.length || /[.,\/\\]/g.test()){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
   if(fs.existsSync(args[0])){
      fs.rmdirSync(`${connectedUser.pwd}/${args[0]}`);
      ftpSocket.write("250 Requested file action okay, completed\r\n");
   }else{
      ftpSocket.write("550 Requested action not taken\r\n");
   }
}

exports.handlePwd = handlePwd;
exports.handleCwd = handleCwd;
exports.handleMkd = handleMkd;
exports.handleRmd = handleRmd;