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

---

## 📥 **Installation**

# Node.js Installation Guide

Make sure you have Node.js (v12.0.0 or higher) installed on your machine. Follow the steps below to install Node.js.

1. Go to the Node.js official website.
2. Download the LTS version, which is recommended for most users.
3. Run the installer and follow the setup wizard instructions.
4. Verify Installation
5. After installation, you can verify that Node.js is successfully installed by running the following commands in your terminal or command prompt:

### Verify Installation

Run the below code in terminal

```sh
$ node -v
```

This command should return the version number of Node.js installed on your system, and it should be 12.0.0 or higher.

#### To check if npm (Node Package Manager) is installed alongside Node.js, run:

```sh
$ npm -v
```

This will display the version number of npm, which is required to install packages like Ftp-For-Node.

# Install Ftp-For-Node

You can install the package using npm:

```sh
$ npm install --save ftp-for-node
```

Make sure your project is set up with Node.js (v12.0.0 or higher).

You can find the package on npmjs.com here:

https://www.npmjs.com/package/ftp-for-node

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

## ✨ **Features**

### **Client Features**

The FTP client provides several customizable features:

1. **Data Channel Port**  
   Configure the port for the data channel (required for active mode):

   ```javascript
   ftp.dataChannel.port = 3000;
   ```

2. **Local File Reference**  
   Specify the local path for retrieving or storing files:

   ```javascript
   ftp.localSite = "absolute_pathname";
   ```

3. **Authorization**  
   You can provide credentials if the server doesn’t support anonymous access:

   ```javascript
   ftp.user = "abc";
   ftp.password = "123";
   ```

4. **Secure Connection (TLS/SSL)**  
   For secure FTP connections, provide key and certificate files:

   ```javascript
   ftp.secureOptions.key = fs.readFileSync("key.pem");
   ftp.secureOptions.cert = fs.readFileSync("cert.pem");
   ```

5. **Control Channel Port and Address**  
   Customize the port and address for the control channel:
   ```javascript
   ftp.port = 21; // Default FTP port
   ftp.address = "localhost"; // Default address
   ```

---

### **Server Features**

The FTP server includes several configuration options:

1. **Authorized User Details**  
   Define a list of users with access to the server:

   ```javascript
   server.userDetails = [
     { name: "abc", password: "123", pwd: "path_to_folder" },
   ];
   ```

2. **Local Connection Details**  
   Customize the control channel’s port and address:

   ```javascript
   server.localPort = 21; // Default: 21
   server.localAddress = "localhost"; // Default: localhost
   ```

3. **Passive Connection Settings**  
   Configure the FTP server to support passive mode:

   ```javascript
   server.passive = {
     active: true, // Enable passive mode
     address: "127.0.0.1",
     port: 40000, // Starting port for passive data connections
   };
   ```

4. **Anonymous Access**  
   Allow anonymous users to connect with restricted access:

   ```javascript
   server.defaultPWD = "path_to_anonymous_folder";
   ```

5. **Secure Server (TLS)**  
   Add TLS/SSL support for secure FTP connections:
   ```javascript
   server.secureOptions.key = fs.readFileSync("key.pem");
   server.secureOptions.cert = fs.readFileSync("cert.pem");
   ```

---

## 📜 **Methods Overview**

Below is an overview of the main methods available in the **FtpClient** class:

| Method                                   | Description                                    |
| ---------------------------------------- | ---------------------------------------------- |
| `PORT("h1,h2,h3,h4,h5,p1,p2", callback)` | Send the port number for active mode.          |
| `PASV(callback)`                         | Convert to passive mode.                       |
| `LIST([pathname], callback)`             | List files in the current directory.           |
| `RETR(pathname, callback)`               | Retrieve files from the server.                |
| `STOR(pathname, callback)`               | Store local files on the server.               |
| `APPE(pathname, callback)`               | Append data to an existing file on the server. |
| `MKD(pathname, callback)`                | Create a new directory on the server.          |
| `RMD(pathname, callback)`                | Remove a directory on the server.              |
| `PWD(callback)`                          | Get the current working directory.             |
| `CWD(pathname, callback)`                | Change the working directory.                  |
| `QUIT(callback)`                         | Close the control connection.                  |
| `AUTH('tls', callback)`                  | Enable explicit security using TLS.            |

---


## ⚙️ **How to Use Methods**

All methods follow the general pattern below:

```javascript
FtpClient.method(arg, callback: function(err, msg))
```

For example, to retrieve a file from the server:

```javascript
ftp.RETR("path/to/file", (err, msg) => {
  if (err) {
    console.error("Error retrieving file:", err);
  } else {
    console.log("File retrieved successfully:", msg);
  }
});
```
