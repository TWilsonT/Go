class NetworkAdapter {

	constructor(){

	}

	sendMove(){
		console.log("unimplemented method call");
	}

	getAIMove(size, board, lastMove, callback){
		var data = {
			"size": size,
			"board": board,
			"last": lastMove
		};

		$.ajax({
			type: 'POST',
			url : '/ai',
			dataType: "json",
			data : JSON.stringify(data),
			contentType : "application/json",
			success : function(res){
				callback(res);
			},
			error : function(res){
				log(res.responseText);
			}
		});
	}

	createAccount(username, password, security, callback) {
		var socket = io();

		// sending data to server to authenticate
		socket.emit("newAccount", {username: username, password: password, security: security});

		socket.on("regSuccess", function() {
				callback(true);
		});
		socket.on("regFail", function() {
				callback(false);
		});
	}

	updateAccount(){
		console.log("unimplemented method call");
	}

        /**
         * @param {string} username
         * @param {string} password
         * @param {function} callback - function that is called when server responds with authentication results
         */
	login(username, password, callback){
            var socket = io();

            // sending data to server to authenticate
            socket.emit("accountLogin", {username: username, password: password});

            // Login succeeded
            socket.on("loginSucceeded", function(){
                callback(true, socket.id);
            });

            // Login failed
            socket.on("loginFailed", function(){
                callback(false, null);
            });
	}

	userWinLoss(username, callback) {
			var socket = io();

			socket.emit("getWinLoss", {username: username});

			socket.on("requestSuccess", function(wlHistory) {
				callback(true, wlHistory);
			});

			socket.on("requestFail", function() {
				callback(false, null);
			});
	}

	updatePassword(password, username, callback) {
		var socket = io();

		socket.emit("updatePassword", {password: password, username: username});

		socket.on("updateSuc", function() {
			callback(true);
		});

		socket.on("updateFail", function () {
			callback(false);
		});
	}
}
