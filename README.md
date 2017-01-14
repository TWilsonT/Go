# Let's GO!

<!-- describe the system at a higher level --->

By: Adam Leung, Amrit Thind, Arshi Annafi, Brian Pattie, and Travis Wilson





## System Requirements
The machine must have:  

- [Node.js](https://nodejs.org/en/) (v4.4.7 LTS)
- [MongoDB](https://www.mongodb.com/) (v3.2.6) 





## Running the Web Application
This section outlines steps to start our web application.



On a Windows machine:

- <b>First time</b>: Before starting the database,
you must ensure that `C:\data\db` exists.
Please manually create all required folders.


1. Start the database by running `mongod.exe` on a command prompt.
	- This ".exe" file is found in the MongoDB installation directory: `C:\Program Files\MongoDB\Server\3.2\bin`.
	
2. Before running our server, install all dependencies by running `npm install`.
    
3. Start our server by running the `server.js` file.
	- From a separate command prompt window, run `node server.js` from the `go-project-server` folder.

4. From a browser of your choice, browse `localhost:30154`



You can also save the following commands saved in a `.bat` file and run from the root directory (go-project-server) of our web app.
```
start cmd /k "C:\Program Files\MongoDB\Server\3.2\bin\mongod.exe"
node server.js
```





---
Made with ❤ in Victoria. Summer 2016.