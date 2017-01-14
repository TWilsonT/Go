
var socket = io();

var nfBuilder = new NotificationBuilder();

var user;





if (sessionStorage.isGuest === "true") {
    
    $("#button_myAccount").css("display", "none");

    if (sessionStorage.username === undefined) {
        // Guest and first time landing on this page
        // therefore, do a guest login
        requestNewGuestLogin();
    } else {
        // Redirected to this page or refresh
        // therefore, request user data
        requestUserData(sessionStorage.username);
    }

} else if (sessionStorage.isGuest === "false") {
    // user logged in using username and password
    // therefore, request user data
    requestUserData(sessionStorage.username);
}





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


function routeProfile() {
  window.location.href = "/ProfileView.html";
}


/******************************** Button clicks *******************************/

$("#button-hotseat").click(function () {
    var gameMode = "hotseat";

    // Storing for this session
    sessionStorage.gameMode = gameMode;

    // Prompt for board size
    showBoardSizePickerNotification(gameMode);
});

$("#button-ai").click(function () {
    var gameMode = "ai";

    // Storing for this session
    sessionStorage.gameMode = gameMode;

    // Prompt for board size
    showBoardSizePickerNotification(gameMode);
});

$("#button-network").click(function () {
    sessionStorage.gameMode = "network";
    window.location.href = "/multiplayer_lobby.html";
});



/************************* DOM Manipulating functions *************************/

var notification;

/**
 * This function shows a notification to the user and asks to pick a board size
 * @param {string} gameMode - the game mode. "hotseat" or "ai"
 */
function showBoardSizePickerNotification(gameMode) {

//    var nfBuilder = new NotificationBuilder();

    // Title of the notification
    var title = "Starting ";
//    var emphasisStyle = "color: green; display: inline-block;";

    // Making title
    if (gameMode === "hotseat") {
        title += "a <div class='emphasis-hotSeat'>Hotseat</div>";
    } else if (gameMode === "ai") {
        title += "an <div class='emphasis-ai'>AI</div>";
    }
    title += " game";

    // Body text
    var msg = "Please select a board size.";

    // Buttons
    var buttons = [
        nfBuilder.makeNotificationButton("9x9", function () {
            sessionStorage.boardSize = 9;
            window.location.href = "/GameView.html";
        }).attr("class", "notification_button_general")
                ,
        nfBuilder.makeNotificationButton("13x13", function () {
            sessionStorage.boardSize = 13;
            window.location.href = "/GameView.html";
        }).attr("class", "notification_button_general")
                ,
        nfBuilder.makeNotificationButton("19x19", function () {
            sessionStorage.boardSize = 19;
            window.location.href = "/GameView.html";
        }).attr("class", "notification_button_general")
    ];

    // when the notification is canceled
    function onCancel() {
        notification.remove();
        removeScreenLock();
    }

    notification = nfBuilder.makeNotification(title, msg, buttons, onCancel).attr("class", "boardSizeNotification-forGameMode");

    applyScreenLock();
    $("#notificationCenter").append(notification);

}

function applyScreenLock() {
    $("#notification-screenLock").css("display", "block");
}

function removeScreenLock() {
    $("#notification-screenLock").css("display", "none");
}

/**
 * This function clears the body of the HTML page
 * and shows a "Session Expired" notification
 */
function showSessionExpired() {
    // Show notification
    $("#bodyWrapper").remove();
    var nf = nfBuilder.getSessionExpiredNotification();
    nf.appendTo("body");
}





/********************************* Socket IO **********************************/
/**
 * This function requests user data using uername
 * @param {type} username - username of the user
 */
function requestUserData(username) {
    socket.emit("userdataForUsername", username);
}

// The response is recieved here
socket.on('userdataForUsername', function (data) {
    console.log(data);
    sessionStorage.sessionID = data.__socketid;
    user = data;

    if (user === undefined) {
        showSessionExpired();
    }

});



function requestNewGuestLogin() {
    socket.emit('guestLogin', 'guest login');
}

socket.on('guestLogin', function (data) {
    console.log(data);
    user = data;

    if (user === undefined) {
        showSessionExpired();
    } else {
        sessionStorage.username = user.__username;
        sessionStorage.sessionID = user.__socketid;
    }
});

socket.on('_error', function (data) {
    if (data === "sessionExpired") {
        showSessionExpired();
    }
});
