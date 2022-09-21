var fs = require("fs");
function handlePwd(ftpSocket,args,connectedUser){
   console.log("im PWD")
   try{
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
   catch(err){
      console.log(err);
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
  args[0] = args[0].replace(/\\/g,"/");
  args[0] = args[0].split("");
  if(args[0].length > 1){
     if(args[0][args[0].length-1] == '/' || args[0][args[0].length-1] == '\\')
  args[0].pop();
  if(args[0][args[0].length-2] == '/' || args[0][args[0].length-2] == '\\')
  args[0].pop();  
  }

   
  args[0] = args[0].join("");

console.log(args[0].startsWith(originalPWD) , args[0] , originalPWD)
  if(fs.existsSync(args[0]) && fs.statSync(args[0]).isDirectory() && (args[0].startsWith(originalPWD) || args[0] == originalPWD)){
      connectedUser.pwd = args[0];
      ftpSocket.write("250 Requested file action okay, completed\r\n");
   }else{
      ftpSocket.write("550 Requested action not taken\r\n");
   }
}
catch(err){
   console.log(err);
}
}

function handleMkd(ftpSocket,args,connectedUser){
try{
if(!args.length || /[<>\/\\:\|*?]/g.test(args[0])){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
   fs.mkdirSync(`${connectedUser.pwd}/${args[0]}`);
   ftpSocket.write('257 "'+`${connectedUser.pwd}/${args[0]}`+'" created\r\n')
}
catch(err){
   console.log(err);
}
   
}

function handleRmd(ftpSocket,args,connectedUser){
      try{
   if(!args.length || /[.,\/\\]/g.test()){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
   if(fs.existsSync(`${connectedUser.pwd}/${args[0]}`)){
      fs.rmdirSync(`${connectedUser.pwd}/${args[0]}`);
      ftpSocket.write("250 Requested file action okay, completed\r\n");
   }else{
      ftpSocket.write("550 Requested action not taken\r\n");
   }
   }
   catch(err){
      console.log(err);
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
console.log(temp)
   if(temp.join("/").startsWith(originalPWD)){
         connectedUser.pwd = temp.join("/");
   ftpSocket.write("250 Requested file action okay, completed\r\n");
   }
   else{
      ftpSocket.write("550 Requested action not taken\r\n");
   }

   }
   catch(err){
      console.log(err);
   }

}

function handleRnfr(ftpSocket,args,connectedUser){
   try{
         if(!args.length || /[.,\/\\]/g.test()){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
   if(fs.existsSync(`${connectedUser.pwd}/${args[0]}`)){
      oldName = `${connectedUser.pwd}/${args[0]}`;
      ftpSocket.write("250 Requested file action okay, completed\r\n");
   }else{
      ftpSocket.write("550 Requested action not taken\r\n");
   }
   }
   catch(err){
      console.log(err);
   }

}

function handleRnto(ftpSocket,args,connectedUser){
   try{
      if(!args.length || /[.,\/\\]/g.test()){
      ftpSocket.write("501 Syntax error in parameters or argument\r\n");
      return;
   }
   fs.renameSync(oldname,`${connectedUser.pwd}/${args[0]}`);
   ftpSocket.write("250 Requested file action okay, completed\r\n");
   }
   catch(err){
      console.log(err);
   }

}

exports.handlePwd = handlePwd;
exports.handleCwd = handleCwd;
exports.handleMkd = handleMkd;
exports.handleRmd = handleRmd;
exports.handleCdup = handleCdup;