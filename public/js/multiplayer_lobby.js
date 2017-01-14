
sessionStorage.gameMode = "network";

var socket = io();


// Notification objects
var nfBuilder = new NotificationBuilder();
var notification;



/**
 * This object must be retrieved from the server using getUserData.
 * And since this will be received from sever, this object will follow
 * sever-side User specification
 * 
 * @type server-side User object
 */
var user;

socket.emit("userdata", sessionStorage.sessionID);





/**
 * Triggered on keyboard button press
 * 
 * @param {object} event
 */
document.onkeydown = function (event) {

    /**
     * if the user pressed escape, remove the notification
     */
    if (event.keyCode === 27) { // Escape
        notification.remove();
        removeScreenLock();
    }
};





/******************** JavaScript and DOM manipulation *********************/

/* List of functions for DOM manipulation
 *
 * decorateProfile		- updates the profile section
 * onReceivedPlayerList	- inflates the online players' section
 * sendGameRequest		- sends a game request to an user
 * onReceivedGameRequest	- when the client receives a game request
 * onLogoutButtonPress	- when the user presses the logout button
 * 
 */

/**
 * This function updates the profile section of the page.
 */
function decorateProfile() {
    $('#profile-username').html(user.__username);
}

/**
 * This function is called when the 
 * 
 * @param{object} playerList - 'onlineUsers' object form the server
 */
function onReceivedPlayerList(playerList) {

    // Clear the UI
    $('#onlinePlayers-list').empty();

    // generate new list on the UI
    var listIsInflated = false;
    for (var p in playerList) {

        // preventing "self" and players that are in game from appearing on the list
        if (p !== user.__username && !playerList[p].__isInGame) {
            $('#onlinePlayers-list').append(makeOnlineUserRow(playerList[p]));
            listIsInflated = true;
        }

    }

    if (!listIsInflated) {
        $('#onlinePlayers-list').html("No one is online").css("text-align", "center");
        return;
    }

    /**
     * Creates a row for the online users' section
     *
     * @param {object} forUser - User object (follows server-side User object standards)
     */
    function makeOnlineUserRow(forUser) {

        // A row for the player
        var div = $(document.createElement('div'));
        div.addClass("onlinePlayers-row");

        // Username
        var usernameText = $(document.createElement('div'));
        usernameText.html(forUser.__username);
        usernameText.attr("class", "onlinePlayers-username");

        // Button to send request
        var reqButton;

        // Getting 
        if (user.__requestSentList[forUser.__username] === "pending") {
            reqButton = getInvitationSentButton(forUser.__username);
        } else if (user.__requestSentList[forUser.__username] === "declined") {
            reqButton = makeRequestDeclinedButton();
        } else {
            reqButton = makeInvitationButton(forUser);
        }


        // Nesting DOM elements. All that goes in a row for each player
        div.append(usernameText);
        div.append(reqButton);
        div.append($(document.createElement('div')).attr("class", "clearFloat"));

        return div;

    }

    /**
     * Creates a button to challenge a user
     *
     * @param {object} forUser - User object (follows server-side User object standards)
     */
    function makeInvitationButton(forUser) {

        // A button to send game request
        var reqButton = $(document.createElement('div'));
        reqButton.attr("class", "button_sendRequest");
        reqButton.html("Send Invitation");

        reqButton.click(function () {

            applyScreenLock();

            var emphasis = "<div style='color:green; display: inline-block /*styled from multiplayer_lobby.js*/ ' > ";
            emphasis += forUser.__username;
            emphasis += "</div>";

            var title = "Sending a game request to " + emphasis;
            var msg = "Please select a board size.";

            var buttons = [
                nfBuilder.makeNotificationButton("9x9", function () {
                    sendGameRequest(forUser.__username, 9);
                    removeScreenLock();
                    notification.remove();
                    reqButton.replaceWith(getInvitationSentButton(forUser));
                }).attr("class", "notification_button_general")
                        ,
                nfBuilder.makeNotificationButton("13x13", function () {
                    sendGameRequest(forUser.__username, 13);
                    removeScreenLock();
                    notification.remove();
                    reqButton.replaceWith(getInvitationSentButton(forUser));
                }).attr("class", "notification_button_general")
                        ,
                nfBuilder.makeNotificationButton("19x19", function () {
                    sendGameRequest(forUser.__username, 19);
                    removeScreenLock();
                    notification.remove();
                    reqButton.replaceWith(getInvitationSentButton(forUser));
                }).attr("class", "notification_button_general")
            ];

            function onCancel() {
                notification.remove();
                removeScreenLock();
            }

            notification = nfBuilder.makeNotification(title, msg, buttons, onCancel).attr("class", "boardSizeNotification-forOnlinePlayers");

            $("#notificationCenter").append(notification);

        });

        return reqButton;
    }

}



/**
 * This function hides everything that is in the lobbyBody div.
 * This function is used to hide everything in case of an unauthorized access.
 */
function hideLobbyBody() {
    $("#lobbyBody").css("display", "none");
}

/**
 * Makes the "notification-screenLock" div visible. (The grey screen in between the body and notifications)
 */
function applyScreenLock() {
    $("#notification-screenLock").css("display", "block");
}

/**
 * Hides the "notification-screenLock" div.
 */
function removeScreenLock() {
    $("#notification-screenLock").css("display", "none");
}



/**
 * This function returns the "Invitation Sent" button to swap out
 * with the "Send Invitation" button when an invitation is sent to a user
 * 
 * @param {string} toUser
 * @returns {DOM object} div
 */
function getInvitationSentButton(toUser) {

    var requestSentButton;

    requestSentButton = $(document.createElement('div'));
    requestSentButton.html("Invitation Sent");
    requestSentButton.attr("class", "button_requestSent");
    requestSentButton.attr("toUser", toUser);

    return requestSentButton;
}

/**
 * This function returns the "Request Declined" button to swap out 
 * when a game request is declined
 * 
 * @returns {DOM object} div
 */
function makeRequestDeclinedButton() {
    var button;
    button = $(document.createElement('div'));
    button.html("Request Declined");
    button.attr("class", "button_requestDecliend");
    return button;
}



/**
 * This function is called when the user receives a game request
 * 
 * @param {string} fromUser - username
 * @param {int} boardSize - size of the board
 */
function addGameRequest(fromUser, boardSize) {

    // Make received game request UI
    var gameRequest;
    

    var title = "";
    var msg = "Game request form <b>" + fromUser + "</b><br>Board size: <b>" + boardSize + "x" + boardSize + "</b>";
    var buttons = [makeAcceptButton(), makeDeclineButton()];

    gameRequest = nfBuilder.makeNotification(title, msg, buttons);
    gameRequest.addClass("gameRequestsNotification");
    gameRequest.attr("fromUser", fromUser);

    // Adding received game request
    $("#gameRequests-wrapper").append(gameRequest);



    /**
     * Returns the accept button for the received game request
     * 
     * @returns {div}
     */
    function makeAcceptButton() {
        var button = $(document.createElement('div'));
        button.attr("class", "button_acceptRequest");
        button.html("Accept");
        button.click(function () {
            acceptRequest(fromUser, boardSize);
        });
        return button;
    }

    /**
     * Returns the decline button for the received game request
     * 
     * @returns {div}
     */
    function makeDeclineButton() {
        var button = $(document.createElement('div'));
        button.attr("class", "button_declineRequest");
        button.html("Decline");
        button.click(function () {
            declineRequest(fromUser);
            gameRequest.remove();
        });
        return button;
    }
}

/**
 * This function is called to update UI to show all requests that are not responded to
 */
function showPendingGameRequests() {
    for (var fromUser in user.__requestReceivedList) {
        var boardSize = user.__requestReceivedList[fromUser];
        addGameRequest(fromUser, boardSize);
    }
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
        
        // todo Travis 
    }

    var buttons = [
        nfBuilder.makeNotificationButton("Return", onClose).attr("class", "leftGameInProgressNotification-button")
//        ,
//        nfBuilder.makeNotificationButton("Replay", onReplay).attr("class", "leftGameInProgressNotification-button")
    ];

    nf = nfBuilder.makeNotification(title, msg, buttons).attr("class", "leftGameInProgressNotification");

    $("#notificationCenter").append(nf);
}





/********************************* Socket IO **********************************/
/* 
 * List of functions that calls the server
 * 
 * sendGameRequest()    - to send a game request
 * acceptRequest()      - to accept a game request
 * declineRequest()     - to decline a game request
 * 
 * 
 * 
 * List of triggered events on the client
 * 
 * requestAccepted      - when server confirms a game request has been accepted
 * playerList 		- when the server sends a list of all online players
 * gameRequest		- when the server sends a game request
 * userdata             - when server sends with user data
 * _error               - when the server sends an error signal that require
 *      notInMpLobby        - end user is no longer in the lobby
 *      sessionExpired      - session expired
 *
 */



/**
 * This function sends a game request to the target user
 *
 * @param {string} toUser - The target user
 * @param {int} boardSize - the size of the board
 */
function sendGameRequest(toUser, boardSize) {
    
    // Adding request to local user data
    user.__requestSentList[toUser] = "pending";

    // Sending game request
    var data = {
        type: "sendRequest",
        toUser: toUser,
        fromUser: user.__username,
        boardSize: boardSize
    };
    socket.emit("gameRequest", data);
}

/**
 * This function is called to accept a game request
 * 
 * @param {string} toUser
 * @param {int} boardSize
 */
function acceptRequest(toUser, boardSize) {
    var data = {
        type: "requestAccepted",
        toUser: toUser,
        fromUser: user.__username,
        boardSize: boardSize
    };
    socket.emit("gameRequest", data);
}

/**
 * This function is called to decline a game request
 * 
 * @param {string} toUser
 */
function declineRequest(toUser) {
    var data = {
        type: "requestDeclined",
        toUser: toUser,
        fromUser: user.__username
    };
    socket.emit("gameRequest", data);
}




// Server sent back user data
socket.on('userdata', function (data) {
    user = data;
    sessionStorage.sessionID = user.__socketid;

    if (user.__isInGame === true) {
        socket.emit("userLeftGame", {toUser: user.__opponent, fromUser: user.__username});
        user.__isInGame = false;
        user.__opponent = null;
    }

    decorateProfile();
    showPendingGameRequests();
});



// Event: When client receives online players' list
socket.on('playerList', function (data) {

    // String to object
    var playerList = JSON.parse(data);

    onReceivedPlayerList(playerList);
});



// The client received a game request
socket.on('gameRequest', function (data) {
    addGameRequest(data.fromUser, data.boardSize);
});



socket.on('requestAccepted', function () {
    // redirecting to game view
    window.location.href = "/GameView.html";
});

socket.on('requestDeclined', function (fromUser) {
    $("div[toUser='" + fromUser + "']").replaceWith(makeRequestDeclinedButton());
});


// Log Error if server sends an error message
socket.on('_error', function (data) {

    if (data.type === "notInMpLobby") {

        console.log("user is not MpLobby ");
        
        // todo 1. notify user that the invited user has left the lobby
        applyScreenLock();
        
        var title = "User is offline";
        var msg = "<b>" + data.username + "</b> is no longer online";
        var button = nfBuilder.makeNotificationButton("Ok", onClose);
        button.attr("class", "notification_button_general");

        notification = nfBuilder.makeNotification(title, msg, button, onClose);
        notification.attr("class", "notification-userOffline");
        $("#notificationCenter").append(notification);
        
        function onClose(){
            notification.remove();
            removeScreenLock();
        }

        // todo 2. remove the game request
        $("div[fromUser='" + data.username + "']").remove();
        delete(user.__requestReceivedList[data.username]);

    } else if (data === "sessionExpired") {

        hideLobbyBody();

        var nf = nfBuilder.getSessionExpiredNotification();
        nf.appendTo("body");

    } else {
        // any other error messages
        console.log(data);
    }
});