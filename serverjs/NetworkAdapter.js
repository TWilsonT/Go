
var http = require("http");

module.exports = {
	getAIMove(postData, callback){
		var option = {
			host: "roberts.seng.uvic.ca",
			port: "30000",
			path: "/ai/maxLibs",
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			}
		};

		var cb_onGOAIServerResponse = function (response) {
			var str = "";
			
			response.on('data', function (chunk) {
				str += chunk;
			});

			response.on("end", function () {
				callback(str);
			});
		};

		var myreq = http.request(option, cb_onGOAIServerResponse);
		
		myreq.on("error", function (e) {
			console.log("problem with HTTP POST request\n" + e.toString());
		});

		myreq.write(JSON.stringify(postData));
		
		myreq.end();
	}
}
