var fs = require("fs");
var path = require("path");
function handlePwd(ftpSocket,args,connectedUser){
   try{
      if(args.length){
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
         }
      if(!connectedUser.pwd){
         ftpSocket.write("550 Requested action not taken\r\n");
         return;
      }else{
         if(fs.existsSync(path.normalize(connectedUser.pwd)))
         ftpSocket.write('257 "'+connectedUser.pwd+'"\r\n');
         else
         ftpSocket.write("550 Requested action not taken\r\n");
      return;
      }
   }
   catch(err){
      console.log(err);
      ftpSocket.write("502 Command not implemented\r\n");
   }

}

function handleCwd(ftpSocket,args,connectedUser,originalPWD){
try{
      if(!args.length){
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
      }
      if((args[0].indexOf('/') == 0 || args[0].indexOf('./') == 0 || args[0].indexOf('\\') == 0 || args[0].indexOf('.\\') == 0) && process.platform == "win32"){
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
      }
      if((args[0].indexOf('./') == 0 || args[0].indexOf('\\') == 0 || args[0].indexOf('.\\') == 0) && process.platform != "win32"){
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
      }

      args[0] = args.join(" ");
      args[0] = args[0].replace(/\\/g,"/");
      args[0] = args[0].split("");
      if(args[0].length > 1){
         if(args[0][args[0].length-1] == '/' || args[0][args[0].length-1] == '\\')
         args[0].pop();
         if(args[0][args[0].length-2] == '/' || args[0][args[0].length-2] == '\\')
         args[0].pop();  
      }
      originalPWD = originalPWD.replace(/\\/g,"/");
      originalPWD = originalPWD.split("");
      if(originalPWD.length > 1){
         if(originalPWD[originalPWD.length-1] == '/' || originalPWD[originalPWD.length-1] == '\\')
         originalPWD.pop();
         if(originalPWD[originalPWD.length-2] == '/' || originalPWD[originalPWD.length-2] == '\\')
         originalPWD.pop();  
      }
      originalPWD = originalPWD.join("");
      originalPWD = path.normalize(originalPWD);
         
      args[0] = path.normalize(args[0].join(""));
      if(!path.isAbsolute(args[0])){
         args[0] = (connectedUser && connectedUser.pwd)? path.normalize(`${connectedUser.pwd}/${args[0]}`):path.normalize(`${originalPWD}/${args[0]}`)
      }
      if(fs.existsSync(args[0]) && fs.statSync(args[0]).isDirectory() && (args[0].startsWith(originalPWD) || args[0] == originalPWD)){
            connectedUser.pwd = args[0];
            ftpSocket.write("250 Requested file action okay, completed\r\n");
            return;
      }

      ftpSocket.write("550 Requested action not taken\r\n");
      return;
      
}
catch(err){
   console.log(err);
   ftpSocket.write("502 Command not implemented\r\n");
}
}

function handleMkd(ftpSocket,args,connectedUser){
try{
   if(!args.length || /[<>\/\\:\|*?]/g.test(args[0])){
         ftpSocket.write("501 Syntax error in parameters or argument\r\n");
         return;
   }
   fs.mkdirSync(path.normalize(`${connectedUser.pwd}/${args[0]}`));
   ftpSocket.write('257 "'+path.normalize(`${connectedUser.pwd}/${args[0]}`)+'" created\r\n')
      return;
}
catch(err){
   console.log(err);
}
   
}

function handleRmd(ftpSocket,args,connectedUser){
   try{
         if(!args.length || /[<>:*?\/\\]/g.test()){
            ftpSocket.write("501 Syntax error in parameters or argument\r\n");
            return;
         }
         if(fs.existsSync(path.normalize(`${connectedUser.pwd}/${args[0]}`))){
            fs.rmdirSync(path.normalize(`${connectedUser.pwd}/${args[0]}`));
            ftpSocket.write("250 Requested file action okay, completed\r\n");
         }else{
            ftpSocket.write("550 Requested action not taken\r\n");
         }
   }
   catch(err){
      console.log(err);
      ftpSocket.write("502 Command not implemented\r\n");
   }

}

function handleCdup(ftpSocket,args,connectedUser,originalPWD){
   try{
      if(args.length){
         ftpSocket.write("501 Syntax error in parameters or argument\r\n");
         return;
      }
      let temp= connectedUser.pwd.split("/");
      temp.pop();
      if(temp[0] == "")temp[0] = '/'
      if(temp.join("/").startsWith(originalPWD)){
            connectedUser.pwd = temp.join("/");
            ftpSocket.write("250 Requested file action okay, completed\r\n");
            return;
      }
      else{
         ftpSocket.write("550 Requested action not taken\r\n");
         return;
      }

   }
   catch(err){
      console.log(err);
      ftpSocket.write("502 Command not implemented\r\n");
   }

}
let oldName = null;
function handleRnfr(ftpSocket,args,connectedUser){
   try{
      if(!args.length || /[<>:*?\/\\]/g.test()){
         ftpSocket.write("501 Syntax error in parameters or argument\r\n");
         return;
      }
      if(fs.existsSync(path.normalize(`${connectedUser.pwd}/${args[0]}`))){
         oldName = path.normalize(`${connectedUser.pwd}/${args[0]}`);
         ftpSocket.write("250 Requested file action okay, completed\r\n");
      }else{
         ftpSocket.write("550 Requested action not taken\r\n");
      }
   }
   catch(err){
      console.log(err);
      ftpSocket.write("502 Command not implemented\r\n");
   }

}

function handleRnto(ftpSocket,args,connectedUser){
   try{
      if(!args.length || /[<>:*?\/\\]/g.test()){
         ftpSocket.write("501 Syntax error in parameters or argument\r\n");
         return;
      }
      fs.renameSync(oldName,path.normalize(`${connectedUser.pwd}/${args[0]}`));
      ftpSocket.write("250 Requested file action okay, completed\r\n");
   }
   catch(err){
      console.log(err);
      ftpSocket.write("502 Command not implemented\r\n");
   }

}

exports.handlePwd = handlePwd;
exports.handleCwd = handleCwd;
exports.handleMkd = handleMkd;
exports.handleRmd = handleRmd;
exports.handleCdup = handleCdup;
exports.handleRnfr = handleRnfr;
exports.handleRnto = handleRnto;