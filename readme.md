# 🚀 **Ftp-For-Node**

_A basic FTP and Explicit FTPS client and server for Node.js, designed to simplify file transfers. The project includes an FTP client and server implementation with features like file retrieval, directory listing, and secure TLS connections._

[![npm version](https://img.shields.io/npm/v/ftp-for-node)](https://www.npmjs.com/package/ftp-for-node)
[![license](https://img.shields.io/github/license/yourusername/ftp-for-node)](https://github.com/nikhilkalburgi/ftp-for-node)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D12.0.0-green)](https://nodejs.org/)

---

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
   - [Client Example](#client-example)
   - [Server Example](#server-example)
3. [Features](#features)
   - [Client Features](#client-features)
   - [Server Features](#server-features)
4. [Methods Overview](#methods-overview)
5. [How to Use Methods](#how-to-use-methods)
6. [License](#license)

---

## 📥 **Installation**

# Node.js Installation Guide

Make sure you have Node.js (v12.0.0 or higher) installed on your machine. Follow the steps below to install Node.js.

### Windows / macOS / Linux.

1. Go to the Node.js official website.
2. Download the LTS version, which is recommended for most users.
3. Run the installer and follow the setup wizard instructions.
4. Verify Installation
5. After installation, you can verify that Node.js is successfully installed by running the following commands in your terminal or command prompt:

### Verify Installation

```sh
bash
node -v
```

This command should return the version number of Node.js installed on your system, and it should be 12.0.0 or higher.

#### To check if npm (Node Package Manager) is installed alongside Node.js, run:

```sh
bash
npm -v
```

This will display the version number of npm, which is required to install packages like Ftp-For-Node.

# Install Ftp-For-Node

You can install the package using npm:

```bash
npm install --save ftp-for-node
```

Make sure your project is set up with Node.js (v12.0.0 or higher).

# _You can find the package on npmjs.com here:_

https://www.npmjs.com/package/ftp-for-node

---

## 📚 **Usage**

### **Client Example**

Here's how to create and use the FTP client to connect to an FTP server and retrieve files:

```javascript
// Import the FTP Client
const FtpClient = require("ftp-for-node/client");
const ftp = new FtpClient();

// Define the port for the data-channel (e.g., active mode)
ftp.dataChannel.port = 3000;

// Specify the local site for file retrieval (RETR)
ftp.localSite = "E:\\project\\ftp-for-node\\";

// Optional Authorization Details (use for non-anonymous logins)
ftp.user = "abc";
ftp.password = "123";

// Event listener for the 'connect' event
ftp.on("connect", (code, msg) => {
  console.log(`Connection Code: ${code}, Message: ${msg}`);

  // Send port for active mode
  ftp.PORT("127,0,0,1,11,184", (err, msg) => {
    console.log("PORT response:", err, msg);
  });

  // Print the current working directory
  ftp.PWD((err, pwd) => {
    console.log("PWD response:", err, pwd);
  });

  // List files in the current directory
  ftp.LIST(null, (err, msg) => {
    console.log("LIST response:", err, msg);
  });

  // Close the connection
  ftp.QUIT((err, msg) => {
    console.log("QUIT response:", err, msg);
  });
});

// Initialize and connect the client
ftp.connect();
```

### **Server Example**

Here’s how you can set up a simple FTP server:

```javascript
// Import the FTP Server
const FtpServer = require("ftp-for-node/server");

// Create a new FTP server instance
const server = new FtpServer();

// Default directory for anonymous users (required)
server.defaultPWD = "E:/nodefiles";

// Define authorized user details
server.userDetails = [{ name: "abc", password: "123", pwd: "path_to_folder" }];

// Start the FTP server
server.initiateFtpServer();
```

---

### Client Features

The client supports properties like :

Specify the available port for data-channel

1. ftp.dataChannel.port = "number"

For local file reference

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

```

```
