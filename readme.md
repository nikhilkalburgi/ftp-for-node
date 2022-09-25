# Ftp-For-Node
### A basic Ftp client and server for nodejs that helps to make the transfer of files easier.

## To Install
`npm install --save ftp-for-node`



## Examples

**Client**

```

//Import
const FtpClient = require("ftp-for-node/client");
const ftp = new FtpClient();

//Specify the available port for data-channel
ftp.dataChannel.port = 3000;

//For RETR
ftp.localSite = "E:\\project\\ftp-for-node\\";

//For Authorization - optional for anonymous
ftp.user = "abc";
ftp.password = "123";

//"connect" - Listener
ftp.on("connect",(code,msg)=>{
    console.log(code,msg);
    ftp.PORT("127,0,0,1,11,184",(err,msg)=>{
        console.log(err,msg);
    })
    ftp.PWD((err,pwd)=>{
        console.log(err,pwd);
    })
    ftp.LIST(null,(err,msg)=>{
        console.log(err,msg)
    })
    ftp.QUIT((err,msg)=>{
        console.log(err,msg);
    })

})

//Init Client
ftp.connect();

```

**Server**

```

//Import 
const FtpServer = require("ftp-for-node/server");

const server = new FtpServer();

//Mandatory-in case no userDetails exists - anonymous
server.defaultPWD = "E:/nodefiles";

//Array of users who can access - authorized use
server.userDetails = [{name:"abc",password:"123",pwd:"E:\\nodefiles"}];

//Init
server.initiateFtpServer();

```

### Client Features

#### PORT("h1,h2,h3,h4,h5,p1,p2",callback(err,msg))
    To send the port number of data-channel for active mode.

#### PASV(callback(err,msg))  
    Convert to passive mode

#### LIST([pathanme|null],callback(err,msg))
    To list the files in PWD

#### NSLT([pathanme|null],callback(err,msg))
    To list the file name in PWD

#### STOR(pathanme,callback(err,msg))
    To Store the local files in server

#### RETR(pathanme,callback(err,msg))
    To retrieve files from server

#### APPE(pathanme,callback(err,msg))
    To Append the local files in server

#### STOU(pathanme,callback(err,msg))
    To Store with unique name the local files in server

#### RMD(pathanme,callback(err,msg))
    Remove folder

#### MKD(pathanme,callback(err,msg))
    Make folder

#### CWD(pathanme,callback(err,msg))
    Change wprking directory

#### PWD(callback(err,msg))
    Return present directory name

#### TYPE(["I"|"A"],callback(err,msg))
    Change Type

#### SYST(callback(err,msg))
    Return System info

#### STAT([string|null],callback(err,msg))
    Return Current State

#### QUIT(callback(err,msg))
    Close Control Channel



## Server Features

**PROPS**

1. userDetails = [{name:[string],password:[string],pwd:[string]}...]
2. localPort = [number] | default : 21
3. localAddress = [string] | default : localhost
4. passive = this.passive = {active : [boolean] | true,address : [string] | "127.0.0.1",port : [number] | 40000}


**TO INIT**
#### initiateFtpServer()()

