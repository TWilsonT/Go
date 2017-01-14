
function login() {

    var username = $("#user-name").val();
    var password = $("#password").val();
    // jquery's  .val() sanitizes inputs

    if (username === "" || password === "") {
      $('#login-err').html("Please enter your username and password");

    } else {

        (new NetworkAdapter()).login(username, password, onRes);

        /**
         * @param {boolean} success
         * @param {string} socketid (should be null if success is false)
         */
        function onRes(success, socketid) {
            if (success) {
                sessionStorage.isGuest = false;
                sessionStorage.username = username;
                sessionStorage.sessionID = socketid;
                window.location.href = "/gameSelect.html";
            } else {
                // Login failed
				
                $("#login-err").html('Invalid username or password');

            }
        }

    }

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
    if (event.keyCode === 13) { // Enter
        login();
    }
};

/**
 * This function is called when the user clicks the Quick play button
 * called from the onclick attribute of the button in index.html file
 */
function quickplay() {
    sessionStorage.isGuest = true;
    window.location.href = "/gameSelect.html";

}
