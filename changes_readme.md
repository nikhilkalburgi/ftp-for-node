:

🚀 Ftp-For-Node
A basic FTP and Explicit FTPS client and server for Node.js, designed to simplify file transfers. This project includes an FTP client and server implementation with features like file retrieval, directory listing, and secure TLS connections.




Table of Contents
Installation
Usage
Client Example
Server Example
Features
Client Features
Server Features
Methods Overview
How to Use Methods
📥 Installation
Node.js Installation Guide
Make sure you have Node.js (v12.0.0 or higher) installed on your machine. Follow the steps below to install Node.js.

Windows / macOS / Linux
Go to the Node.js official website.
Download the LTS version, which is recommended for most users.
Run the installer and follow the setup wizard instructions.
Verify installation by running the following commands:
bash
Copy code
node -v
This command should return the version number of Node.js installed on your system, and it should be 12.0.0 or higher.

To check if npm (Node Package Manager) is installed alongside Node.js, run:

bash
Copy code
npm -v
Install Ftp-For-Node
Install the package using npm:

bash
Copy code
npm install --save ftp-for-node
You can find the package on npmjs.com here: Ftp-For-Node

📚 Usage
Client Example
Here’s how to create and use the FTP client to connect to an FTP server and retrieve files:

javascript
Copy code
// Import the FTP Client
const FtpClient = require("ftp-for-node/client");
const ftp = new FtpClient();

// Define the port for the data channel (e.g., active mode)
ftp.dataChannel.port = 3000;

// Specify the local directory for file retrieval (RETR)
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
Server Example
Here’s how you can set up a simple FTP server:

javascript
Copy code
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
Features
Client Features
Specify the port for the data channel:
ftp.dataChannel.port = "number"
Local file reference:
ftp.localSite = "absolute pathname"
Optional Authorization:
ftp.user = "string"
ftp.password = "string"
Control TLS security:
ftp.secureOptions.key = fs.readFileSync('key.pem')
ftp.secureOptions.cert = fs.readFileSync('cert.pem')
Control Channel port and