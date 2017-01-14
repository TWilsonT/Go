
/*
 * JavasScript file that runs the GameView.html file
 */

// Variables
var socket = io();
var user;

var nfBuilder = new NotificationBuilder();


// Requesting user data
socket.emit("userdataForUsername", sessionStorage.username);

// onReceive user data
socket.on('userdataForUsername', function (data) {

    // Setting data for session
    sessionStorage.sessionID = data.__socketid;
    user = data;

    // Session expired if
    // no user data received
    // or gameMode is not set (bookmarked link or direct url access)
    if (user === undefined || sessionStorage.gameMode === undefined) {
        // Show notification
        $("#bodyWrapper").remove();
        var nf = nfBuilder.getSessionExpiredNotification();
        nf.appendTo("body");
    } else {
        // render
        if (sessionStorage.gameMode === "hotseat") {
            renderHotSeat();
        } else if (sessionStorage.gameMode === "ai") {
            renderAI();
        } else if (sessionStorage.gameMode === "network") {
            renderNetwork();
        }
    }
});

socket.on("userLeftGame", function () {
    showUserResignedNotification();
});

// When server sends session expire error
socket.on('_error', function (data) {
    if (data === "sessionExpired") {
        // Show notification
        $("#bodyWrapper").remove();
        var nf = nfBuilder.getSessionExpiredNotification();
        nf.appendTo("body");
    }
});





function renderHotSeat() {

    document.getElementById("player1").innerHTML = "Player 1 - Black";
    document.getElementById("player2").innerHTML = "Player 2 - White";

    var boardSize = sessionStorage.boardSize;

    // cleaning up variables
    delete(sessionStorage.gameMode);
    delete(sessionStorage.boardSize);

    // Model - The board
    var myGameSpace = new GameSpace(boardSize);

    // Controller - Game controller
    var gameController = new HotSeatGameController();
    // globalController = gameController;

    // View
    var view = new View();

    view.setGameSpace(myGameSpace);
    view.setController(gameController);
    view.init();
    view.draw(); // Draws the empty board
    view.drawButtons();
    setColourPallet(view);

    gameController.setGameSpace(myGameSpace);
    gameController.setView(view);

    $("#canvas").click(function (e) {
        // Clicked coordinates
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;

        view.onBoardClick(x, y);
        gameController.__historySpot += 1;
    });


    // todo this is repeating 3 times, move to global scope
    $("#leftButton").click(function () {
        console.log("left button");
        var leftButton = document.getElementById('leftButton');
        var rightButton = document.getElementById('rightButton');
        var middleButton = document.getElementById('middleButton');

        if (myGameSpace.__gameOver && leftButton.innerHTML == "<i style=\"font-size: 35px;\" class=\"fa fa-refresh\" aria-hidden=\"true\"><br>Start Replay</i>") {
            leftButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-left\" aria-hidden=\"true\"><br>Reverse</i>";
            rightButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-right\" aria-hidden=\"true\"><br>Forward</i>";
            rightButton.style.visibility = "visible";
            middleButton.style.visibility = "visible";
        } else if (myGameSpace.__gameOver) {
            gameController.rewind();
        } else {
            gameController.pass();
            gameController.__historySpot += 1;
        }
    });
    $("#rightButton").click(function () {
        if (myGameSpace.__gameOver) {
            gameController.replay();
        } else {
            gameController.resign();
            view.changeToControlButtons();
            var middleButton = document.getElementById('middleButton');
            middleButton.style.visibility = "visible";
        }
    });
    $("#middleButton").click(function () {
        if (document.getElementById('middleButton').style.visibility == "visible") {
            window.location.href = "/gameSelect.html";
        }
    });

}

function renderAI() {
    document.getElementById("player1").innerHTML = "Player - Black";
    document.getElementById("player2").innerHTML = "Computer - White";

    var boardSize = parseInt(sessionStorage.boardSize);
    delete(sessionStorage.gameMode);
    delete(sessionStorage.boardSize);

    // Model - The board
    var myGameSpace = new GameSpace(boardSize);

    // Controller - Game controller
    var gameController = new AIGameController();

    // View
    var view = new View();

    view.setGameSpace(myGameSpace);
    view.setController(gameController);
    view.init();
    view.draw(); // Draws the empty board
    view.drawButtons();
    setColourPallet(view);

    gameController.setGameSpace(myGameSpace);
    gameController.setView(view);

    $("#canvas").click(function (e) {
        // Clicked coordinates
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;

        view.onBoardClick(x, y);
        gameController.__historySpot += 1;
    });


    // todo this is repeating 3 times, move to global scope
    $("#leftButton").click(function () {
        console.log("left button");
        var leftButton = document.getElementById('leftButton');
        var rightButton = document.getElementById('rightButton');
        var middleButton = document.getElementById('middleButton');

        if (myGameSpace.__gameOver && leftButton.innerHTML == "<i style=\"font-size: 35px;\" class=\"fa fa-refresh\" aria-hidden=\"true\"><br>Start Replay</i>") {
            leftButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-left\" aria-hidden=\"true\"><br>Reverse</i>";
            rightButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-right\" aria-hidden=\"true\"><br>Forward</i>";
            rightButton.style.visibility = "visible";
            middleButton.style.visibility = "visible";
        } else if (myGameSpace.__gameOver) {
            gameController.rewind();
        } else {
            gameController.pass();
            gameController.__historySpot += 1;
        }
    });
    $("#rightButton").click(function () {
        if (myGameSpace.__gameOver) {
            gameController.replay();
        } else {
            gameController.resign();
            view.changeToControlButtons();
            var middleButton = document.getElementById('middleButton');
            middleButton.style.visibility = "visible";
        }
    });
    $("#middleButton").click(function () {
        if (document.getElementById('middleButton').style.visibility == "visible") {
            window.location.href = "/gameSelect.html";
        }
    });

}


function renderNetwork() {

    document.getElementById("player1").innerHTML = user.__username;
    document.getElementById("player2").innerHTML = user.__opponent;

    console.log("network game acting like hotseat");

    // requesting user data
    socket.emit("userdata", sessionStorage.sessionID);

    // onReceive user data
    socket.on('userdata', function (data) {
        user = data;
        sessionStorage.sessionID = user.__socketid;

        render();
    });

    function render() {
       
        // Model - The board
        console.log(user);
        var myGameSpace = new GameSpace(user.__boardSize);
        var player = 1;

        // Controller - Game controller
        var gameController = new NetworkGameController(socket);

        // View
        var view = new View();

        view.setGameSpace(myGameSpace);
        view.setController(gameController);
        view.init();
        view.draw(); // Draws the empty board
        view.drawButtons();
        setColourPallet(view);

        gameController.setGameSpace(myGameSpace);
        gameController.setView(view);

        //FIXME: This if shouldn't be here, but I see no other place to do it
        if (gameController.__localPlayer === 2) {
            view.lockControls();
        }

        $("#canvas").click(function (e) {
            // Clicked coordinates
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;

            view.onBoardClick(x, y);
            gameController.__historySpot += 1;
        });


        // todo this is repeating 3 times, move to global scope
        $("#leftButton").click(function () {
            console.log("left button");
            var leftButton = document.getElementById('leftButton');
            var rightButton = document.getElementById('rightButton');
            var middleButton = document.getElementById('middleButton');

            if (myGameSpace.__gameOver && leftButton.innerHTML == "<i style=\"font-size: 35px;\" class=\"fa fa-refresh\" aria-hidden=\"true\"><br>Start Replay</i>") {
                leftButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-left\" aria-hidden=\"true\"><br>Reverse</i>";
                rightButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-right\" aria-hidden=\"true\"><br>Forward</i>";
                rightButton.style.visibility = "visible";
                middleButton.style.visibility = "visible";
            } else if (myGameSpace.__gameOver) {
                gameController.rewind();
            } else {
                gameController.pass();
                gameController.__historySpot += 1;
            }
        });
        $("#rightButton").click(function () {
            if (myGameSpace.__gameOver) {
                gameController.replay();
            } else {
                gameController.resign();
                view.changeToControlButtons();
                var middleButton = document.getElementById('middleButton');
                middleButton.style.visibility = "visible";
            }
        });
        $("#middleButton").click(function () {
            if (document.getElementById('middleButton').style.visibility == "visible") {
                window.location.href = "/gameSelect.html";
            }
        });

    }
//<<<<<<< HEAD
//	
//
//	function renderNetwork() {
//	
//   	if(user.__playerNumber==1){
//		document.getElementById("player1").innerHTML = user.__username + " - Black";
//		document.getElementById("player2").innerHTML = user.__opponent + " - White";
//	}
//	else{
//		document.getElementById("player1").innerHTML = user.__username + " - White";
//		document.getElementById("player2").innerHTML = user.__opponent + " - Black";
//		
//	}
//	
//        console.log("network game acting like hotseat");
//
//        // requesting user data
//        socket.emit("userdata", sessionStorage.sessionID);
//
//        // onReceive user data
//        socket.on('userdata', function (data) {
//            user = data;
//            sessionStorage.sessionID = user.__socketid;
//
//            render();
//        });
//
//        function render() {
//            // todo fixme
//            // change from hotseat to network
//
//            // fixme note: the "user" variable has __username and __opponent
//
//            // Model - The board
//            console.log(user);
//            var myGameSpace = new GameSpace(user.__boardSize);
//            var player = 1;
//
//            // Controller - Game controller
//            var gameController = new NetworkGameController(socket);
//
//
//            // View
//            var view = new View();
//
//            view.setGameSpace(myGameSpace);
//            view.setController(gameController);
//            view.init();
//            view.draw(); // Draws the empty board
//            view.drawButtons();
//			setColourPallet(view);
//
//            gameController.setGameSpace(myGameSpace);
//            gameController.setView(view);
//
//            $("#canvas").click(function (e) {
//                // Clicked coordinates
//                var x = e.pageX - $(this).offset().left;
//                var y = e.pageY - $(this).offset().top;
//
//                view.onBoardClick(x, y);
//            });
//
//            // todo this is repeating 3 times, move to global scope
//            $("#leftButton").click(function () {
//                var leftButton = document.getElementById('leftButton');
//                var rightButton = document.getElementById('rightButton');
//
//                if (myGameSpace.__gameOver && leftButton.innerHTML == "<i style=\"font-size: 35px;\" class=\"fa fa-refresh\" aria-hidden=\"true\"><br>Start Replay</i>") {
//                leftButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-left\" aria-hidden=\"true\">Reverse</i>";
//                rightButton.innerHTML = "<i style=\"font-size: 35px;\" class=\"fa fa-chevron-circle-right\" aria-hidden=\"true\">Forward</i>";
//                gameController.startReplay();
//                } else if (myGameSpace.__gameOver) {
//                    gameController.rewind();
//                } else {
//                    gameController.pass();
//                }
//            });
//            $("#rightButton").click(function () {
//                if (myGameSpace.__gameOver) {
//                    gameController.replay();
//                } else {
//                    gameController.resign();
//                    view.changeToReplayButtons();
//                }
//            });
//            $("#middleButton").click(function () {
//                if(document.getElementById('middleButton').style.visibility == "visible"){
//				window.location.href = "/gameSelect.html";
//			}
//            });
//=======
//>>>>>>> master

    // todo update __isOnline flag on the server when the game is over

    // when the game ends, delete session's game mode using the following code
    // delete(sessionStorage.gameMode);
}

function setColourPallet(view) {
	var playerOneText = document.getElementById('player1');
	var playerTwoText = document.getElementById('player2');
	
	var text1 = playerOneText.innerHTML;
	var text2 = playerTwoText.innerHTML;

    $("#colourOne").click(function () {
        view.changeColour("2EC4B6");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Turqoise";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Turqoise";
			}
		}else if(text2.indexOf("Computer") >= 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Turqoise";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Turqoise";
			}
		}
    });
    $("#colourTwo").click(function () {
        view.changeColour("533A71");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Purple";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Purple";
			}
		}else if(text2.indexOf("Computer") >= 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Purple";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Purple";
			}
		}
    });
    $("#colourThree").click(function () {
        view.changeColour("26547C");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Dark Blue";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Dark Blue";
			}
		}else if(text2.indexOf("Computer") >= 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Dark Blue";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Dark Blue";
			}
		}
    });
    $("#colourFour").click(function () {
        view.changeColour("EF476F");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Pink";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Pink";
			}
		}else if(text2.indexOf("Computer") >= 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Pink";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Pink";
			}
		}
    });
    $("#colourFive").click(function () {
        view.changeColour("918EF4");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Fushcia";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Fushcia";
			}
		}else if(text2.indexOf("Computer") > 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Fushcia";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Fushcia";
			}
		}
    });
    $("#colourSix").click(function () {
        view.changeColour("B09398");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Brown";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Brown";
			}
		}else if(text2.indexOf("Computer") >= 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Brown";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Brown";
			}
		}
    });
    $("#colourSeven").click(function () {
        view.changeColour("A1E8AF");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Green";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Green";
			}
		}else if(text2.indexOf("Computer") >= 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Green";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Green";
			}
		}
    });
    $("#colourEight").click(function () {
        view.changeColour("DBD56E");
		if((text2.indexOf("Player") >= 0)){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player 1 - " + "Yellow";
			}else{
				playerTwoText.innerHTML = "Player 2 - " + "Yellow";
			}
		}else if(text2.indexOf("Computer") >= 0){
			if(view.__currentPlayer === 1 ){
				playerOneText.innerHTML = "Player - " + "Yellow";
			}else{
				playerTwoText.innerHTML = "Computer - " + "Yellow";
			}
		}
    });
    $("#playerOne").click(function () {
        view.setPlayer(1);
    });
    $("#playerTwo").click(function () {
        view.setPlayer(2);
    });
    $("#showBar").click(function () {
        view.showBar()
    });
    $("#backOne").click(function () {
        document.body.style.backgroundImage = "url(\"/img/backOne.jpg\")";
    });
    $("#backTwo").click(function () {
        document.body.style.backgroundImage = "url(\"/img/backTwo.jpg\")";
    });
    $("#backThree").click(function () {
        document.body.style.backgroundImage = "url(\"/img/backThree.jpg\")";
    });
}


/**
 * This function creates and shows the winner notification on the screen.
 *
 * @param {object} data - information to display.
 * Should conform to the following specs:
 * data = {
 *      p1Username: string,
 *      p2Username: string,
 *      p1Score: number,
 *      p2Score: number,
 *      winner: string
 * }
 */
function showWinnerNotification(data) {

    var nf;

    $("#notification-screenLock").css("display", "block");

    var title = "Game over";

    var msg = data.p1Username + " : " + data.p1Score;
    msg += "<br>" + data.p2Username + " : " + data.p2Score;
    msg += "<br><br> The winner is: " + data.winner;

    function onClose() {
        // Removing the gray screen lock
        $("#notification-screenLock").css("display", "none");
        nf.remove();
    }

    nf = nfBuilder.makeNotification(title, msg, null, onClose).attr("class", "gameOverNotification");

    $("#notificationCenter").append(nf);
}

/**
 * This function is called when the opponent leaves a network game
 */
function showUserResignedNotification() {
    $("#notification-screenLock").css("display", "block");

    var title = "Your Opponent Has Resigned";

    var msg = "You win";

    function onClose() {
        window.location.href = "/gameSelect.html";
    }

    function onReplay() {
        // Removing the gray screen lock
        $("#notification-screenLock").css("display", "none");

        // todo Travis . this should start replay
    }

    var buttons = [
        nfBuilder.makeNotificationButton("Return", onClose).attr("class", "leftGameInProgressNotification-button")
                ,
        nfBuilder.makeNotificationButton("Replay", onReplay).attr("class", "leftGameInProgressNotification-button")
    ];

    nf = nfBuilder.makeNotification(title, msg, buttons).attr("class", "leftGameInProgressNotification");

    $("#notificationCenter").append(nf);
}
