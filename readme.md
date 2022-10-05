# Ftp-For-Node

A basic Ftp and Explicit FTPS client and server for nodejs that helps to make the transfer of files easier.

## To Install
`  npm install --save ftp-for-node  `



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
server.userDetails = [{name:"abc",password:"123",pwd:"pathname to the folder"}];

//Init
server.initiateFtpServer();

```

### Client Features

The client supports properties like :

Specify the available port for data-channel

1. ftp.dataChannel.port = "number"
    
For  local file reference

2. ftp.localSite = "absolute pathname";
    
For Authorization - optional for anonymous

3. ftp.user = "string";
4. ftp.password = "string";

For AUTH

5. ftp.secureOptions.key = fs.readFileSync('key.pem');
6. ftp.secureOptions.cert = fs.readFileSync('cert.pem');

Control Channel port and address

7. port = "number"
8. address = "string"


#### How to Use the methods ?
    Format :
        FtpClient.method([arg],calback:function(err,msg))

The client supports methods like :

#### PORT("h1,h2,h3,h4,h5,p1,p2",callback(err,msg))
    To send the port number of data-channel for active mode.

#### PASV(callback(err,msg))  
    Convert to passive mode

#### LIST([pathname|null],callback(err,msg))
    To list the files in PWD

#### NSLT([pathname|null],callback(err,msg))
    To list the file name in PWD

#### STOR(pathname,callback(err,msg))
    To Store the local files in server

#### RETR(pathname,callback(err,msg))
    To retrieve files from server

#### APPE(pathname,callback(err,msg))
    To Append the local files in server

#### STOU(pathname,callback(err,msg))
    To Store with unique name the local files in server

#### RMD(pathname,callback(err,msg))
    Remove folder

#### MKD(pathname,callback(err,msg))
    Make folder

#### CWD(pathname,callback(err,msg))
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

#### AUTH('tls',callback(err,msg))
    Explicit Security using TLS


## Server Features

The client supports properties like :

The authorized user details - Optional

1. userDetails = [{name:"string" , password:"string" , pwd:[string] }...]

The local connection details for control channel

2. localPort = "number" | default : 21
3. localAddress = "string" | default : localhost

Passive connection details

4. passive = { active : "boolean" | default : true , address : "string" | default : "127.0.0.1" , port : "number" | default : 40000 }

For AUTH

5. ftp.secureOptions.key = fs.readFileSync('key.pem');
6. ftp.secureOptions.cert = fs.readFileSync('cert.pem');

For anonymous users - mandatory

7. defaultPWD = "string"

**TO INIT**
#### initiateFtpServer()

