
var http = require("http");

var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var server = http.createServer(app);
var io = require("socket.io").listen(server);

app.use(express.static("public"));
app.use(bodyParser.json());



var User = require("./serverjs/User.js");
var NetworkAdapter = require("./serverjs/NetworkAdapter.js");





/****************************** Express Routes ********************************/
app.get("/data", function (req, res) {
    res.end("Hello world");
});

app.get("/ai", function (req, res) {
	// Serving with the AI landing page
	
	// todo: change to actual landing page.
    res.sendfile("public/aiTester.html");
});

app.get("/mp", function (req, res) {
    res.sendfile("public/multiplayer_lobby.html");
});





app.post("/ai", function (req, res) {
	
	var postData = {
        "size": req.body.size,
        "board": req.body.board,
        "last": req.body.last
    };
	
	NetworkAdapter.getAIMove(postData, function(aiRes){
		// if the response is "Invalid request format."
		if (aiRes === "Invalid request format.") {
			// Log and respond with an error
			console.log("Invalid request format. Request: \n" + JSON.stringify(postData) + "\n");
			res.status(400).json(postData);
		} else {
			// callback with the full response
			res.json(aiRes);
		}
	});
	
});





var socketioAdapter = require("./serverjs/SocketIOAdapter.js");
socketioAdapter.listen(io);





/******************************** Port assignment *****************************/
server.listen(30154, function(){
	log("Listening on port 30154");
});





/*********************************** Utils ************************************/
/**
 * This method is simply a shortcut for:
 * console.log(l);
 * @param {var or object} msg - var or object to console-log
 */
function log(msg) {
    console.log(msg);
}