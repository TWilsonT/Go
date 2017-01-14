
var User = require("./User.js");
var db = require("./DatabaseAdapter.js");

// Debug control
var verbose_updateDictionary = false;



/************************ The Online Users' Dictionary *************************
 * Variables:
 *      onlineUsers             - List that maintains users that are online
 *      socketIDtoUsername      - List to lookup username given socketID
 *
 * functions:
 *      addUserInDictionary()       - Adds a new user in the dictionary
 *      updateDictionary()          - Updates relevant data to maintain the structure
 *      removeUserFromDictionary()  - Removes the user from the data structure when they leave
 */

/*
 * List of users that are currently online.
 *
 * The variable should only contain "User" instances.
 * See the User data structure in "./serverjs/User.js"
 *
 * var onlineUsers = {
 *		{string} username1: {object} User1,
 *		{string} username2: {object} User2,
 *		...
 * 	}
 */
var onlineUsers = {};



/*
 * This data structure is useful for user's corresponding socket lookup.
 * This data structure contains socketid and username pairs for lookup purposes.
 * The data structure will look like the following during runtime.
 *
 * var socketIDtoUser = {
 *		socketid1: username1,
 *		socketid2: username2,
 *		...
 * 	}
 */
var socketIDtoUsername = {};



/**
 * This function adds a User object instance to the data structure.
 *
 * @param {object} user - a User object
 * @param {string} socketid
 */
function addUserInDictionary(user, socketid) {

    if (verbose_updateDictionary) {
        console.log("before add");
        console.log(onlineUsers);
    }

    onlineUsers[user.getUsername()] = user;
    socketIDtoUsername[socketid] = user.getUsername();

    if (verbose_updateDictionary) {
        console.log("after add");
        console.log(onlineUsers);
    }
}

/**
 * This function updates all relationships between variables to maintain the data structure
 *
 * @param {string} username
 * @param {string} newSocketid
 */
function updateDictionary(username, newSocketid) {
    if (verbose_updateDictionary) {
        console.log("before update");
        console.log(onlineUsers);
    }

    var user = onlineUsers[username];
    var oldSocketID = user.getSocketID();

    user.setSocketID(newSocketid);

    delete(socketIDtoUsername[oldSocketID]);
    socketIDtoUsername[newSocketid] = user.getUsername();

    if (verbose_updateDictionary) {
        console.log("after update");
        console.log(onlineUsers);
    }

}

/**
 * This function removes relationships and user from the server
 *
 * @param {string} username
 */
function removeUserFromDictionary(username) {
    if (verbose_updateDictionary) {
        console.log("before remove");
        console.log(onlineUsers);
    }

    if (onlineUsers[username] === undefined) {
        console.log("user left after server restarted. removeUserFromDictionary()");
    } else {

        // todo save user data before deleting
        console.log("user left. save user data as required. (./SocketIOAdapter.js)");
        
        var user = onlineUsers[username];
        var socketid = user.getSocketID();

        // todo Taking up too much server time. do when server is idle
//        var userThatLeft = onlineUsers[username];
//        var socketid = userThatLeft.getSocketID();
//
        // Working 
//        var requestSentList = userThatLeft.getRequestSentList();
//        for (var username in requestSentList){
//            onlineUsers[username].removeFromRequestReceivedList(userThatLeft.getUsername());
//        }
//        
        // Not sure if working
//        var requestReceivedList = userThatLeft.getRequestReceivedList();
//        for (var username in requestReceivedList){
//            onlineUsers[username].updateRequestStatus(userThatLeft.getUsername(), "declined");
//        }
 
        delete(socketIDtoUsername[socketid]);
        delete(onlineUsers[username]);
    }

    if (verbose_updateDictionary) {
        console.log("after remove");
        console.log(onlineUsers);
    }

}

/*********************** End of Online Users' Dictionary **********************/




/*
 *******************************************************************************
 ********************************* Socket IO ***********************************
 *******************************************************************************
 *
 * -------------------- List of events triggered on server ---------------------
 *
 *  newPlayer       - when client connects and sends its username
 *  gameRequest     - when the server receives a game request from a client
 *  move            - when user makes a move
 *  disconnect      - Socket.io event. When a user disconnects
 *
 *  guestLogin               - user did not logged in (i.e. guest)
 *  accountLogin             - user logged in with username and password
 *  userdataForUsername      - user data request given username
 *  userdata                 - user data request given socketid
 *
 *  gameRequest
 * 	sendRequest         - when a client sends a game request to another client
 * 	requestAccepted     - when a client accepts a game request
 * 	requestDeclined     - when a client declines a game request
 *
 *  move                     - relay moves during network game
 *  updateSocketIDForUser    - called when socket id needs to be updates. (see more doc below)
 *
 *
 *
 * ------------ List of events triggered by the server to the client -----------
 *
 *  gameRequest             - to let client know
 *      sendRequest
 *      requestAccepted
 *      requestDeclined
 *
 *  loginSucceeded          - when user login is successful
 *  loginFailed             - when user login fails
 *  playerList              - to send client(s) all users that are in mp-lobby
 *  userdataForUsername     - responding with user's data
 *  userdata                - responding with user's data
 *  _error                  - error messages
 *  	sessionExpired      - user is not in online dictionary.
 *                              Reasons: bookmarked page or data loss (fast frequent refreshes)
 *  	notInMpLobby        - when user is no longer in the lobby.
 *                              Reasons: went back to other pages or left the server completely
 *
 *******************************************************************************/

function listen(io) {

    io.on('connection', function (socket) {
        // A new user connected to the server here



        socket.on('guestLogin', function () {

            // Make new user object
            var newUser = new User(getName());
            newUser.setSocketID(socket.id);

            // add user in dictionary
            addUserInDictionary(newUser, socket.id);

            // respond
            socket.emit('guestLogin', newUser);
        });



        socket.on('accountLogin', function (data) {

            /*
             * data should have user name and password (plain or hashed)
             * i.e.
             * data = {
             *      username: string,
             *      password: string
             * }
             */

            // Authenticate login
            db.authenticate(data.username, data.password, function(authSucess) {
                if (authSucess) {
                    // get user data
                    var user = db.getUserData(data.username);

                    // init socket id
                    user.setSocketID(socket.id);

                    // add user in dictionary
                    addUserInDictionary(user, socket.id);

                    // respond
                    socket.emit("loginSucceeded", user);

                } else {
                    // respond that login failed
                    console.log("login failed. login request:");
                    console.log(data);
                    socket.emit("loginFailed");
                }
            });
        });

        socket.on('newAccount',  function(data){
          db.register(data.username, data.password, data.security, function(regSuc) {
            if(regSuc) {
                    socket.emit("regSuccess");
                }
                else {
                    //Reg faild
                    console.log('Registration failed. Registration request:');
                    console.log(data);
                    socket.emit("regFail");
                }
            });
        });

        socket.on('getWinLoss', function(data) {
            db.winLoss(data.username, function(reqSuc, wlHistory) {
              if(reqSuc) {
                //request Successful
                socket.emit("requestSuccess", wlHistory);
              }
              else {
                //request Failed
                console.log('User Win Loss history request failed for user:');
                console.log(data);
                socket.emit("requestFail");
              }
            });
        });

        socket.on('updatePassword', function(data) {

          db.updatePass(data.password, data.username, function(updateSuc) {
            if(updateSuc) {
              socket.emit("updateSuc");
            }
            else {
              console.log('Password update failed');
              socket.emit("updateFail");
            }
          });


        });

        /**
         * Currently used from the game selection page
         * Used to request data given an username
         */
        socket.on('userdataForUsername', function (username) {

            var user = onlineUsers[username];

            if (user === undefined) {
                socket.emit("_error", "sessionExpired");
            } else {
                user.setSocketID(socket.id);
                user.setIsOnline(true);
                updateDictionary(username, socket.id);

                socket.emit("userdataForUsername", user);
            }

        });





        /**
         * Currently used in multiplayer lobby
         *
         * Sends user data to requester, updates dictionary,
         * and finally sends online users' list to all active users in lobby.
         */
        socket.on('userdata', function (socketID) {

            var oldSocketID = socketID;
            var username = socketIDtoUsername[oldSocketID];
            var user = onlineUsers[username];
            var newSocketID = socket.id;

            if (user === undefined) {
                // if user is not on server memory
                socket.emit("_error", "sessionExpired");

            } else {
                user.setIsOnline(true);
                updateDictionary(username, newSocketID);

                socket.emit("userdata", user);
                broadcastOnlinePlayers(socket);
            }


        });



        /**
         * Server received a game request from a client
         */
        socket.on('gameRequest', function (data) {
            if (onlineUsers[data.toUser] === undefined) {

                // removing request
                onlineUsers[data.fromUser].removeFromRequestReceivedList(data.toUser);

                // signalling error
                var resData = {
                    type: "notInMpLobby",
                    username: data.toUser
                };
                socket.emit("_error", resData);

            } else {
                
                
                
                if (data.type === "sendRequest") {
                        // update user data
                        onlineUsers[data.fromUser].addToRequestSentList(data.toUser);
                        onlineUsers[data.toUser].addToRequestReceivedList(data.fromUser, data.boardSize);

                        var newData = {
                            fromUser: data.fromUser,
                            boardSize: data.boardSize
                        };

                        // send game request signal
                        io.sockets.connected[onlineUsers[data.toUser].getSocketID()].emit("gameRequest", newData);
                   


                } else if (data.type === "requestAccepted") {

                        // todo decline all pending game requests

                        // update data
                        onlineUsers[data.fromUser].setOpponent(data.toUser);
                        onlineUsers[data.toUser].setOpponent(data.fromUser);

                        onlineUsers[data.fromUser].setBoardSize(data.boardSize);
                        onlineUsers[data.toUser].setBoardSize(data.boardSize);

                        onlineUsers[data.fromUser].setIsInGame(true);
                        onlineUsers[data.toUser].setIsInGame(true);

                        onlineUsers[data.fromUser].setPlayerNumber(2);
                        onlineUsers[data.toUser].setPlayerNumber(1);
                        
                        onlineUsers[data.fromUser].removeFromRequestReceivedList(data.toUser);
                        onlineUsers[data.toUser].removeFromRequestSentList(data.fromUser);

                        // Signal both users that the game has been approved by the server
                        io.sockets.connected[onlineUsers[data.toUser].getSocketID()].emit("requestAccepted");
                        io.sockets.connected[onlineUsers[data.fromUser].getSocketID()].emit("requestAccepted");

                        // Send out online players' list
                        broadcastOnlinePlayers(socket);



                } else if (data.type === "requestDeclined") {
                        // updating status
                        onlineUsers[data.toUser].updateRequestStatus(data.fromUser, "declined");
                        onlineUsers[data.fromUser].removeFromRequestReceivedList(data.toUser);

                        // telling the client
                        io.sockets.connected[onlineUsers[data.toUser].getSocketID()].emit("requestDeclined", data.fromUser);
                        
                        
                        
                }
            }
        });



        // When a user makes a move
        socket.on('move', function (data) {

            var toUserSocketID = onlineUsers[data.toUser].getSocketID();
            io.sockets.connected[toUserSocketID].emit("move", data); // second param can be an object

        });



        // When a user resigns
        socket.on('resign', function (data) {

            var toUserSocketID = onlineUsers[data.toUser].getSocketID();
            io.sockets.connected[toUserSocketID].emit("resign"); // second param can be an object

        });



        // When the game ends after 2 passes
        socket.on('gameOver', function (data) {

            var toUserSocketID = onlineUsers[data.toUser].getSocketID();
            io.sockets.connected[toUserSocketID].emit("gameOver"); // second param can be an object

        });

        // Add a win to the user's account
        socket.on('addWin', function (data) {

            db.addWin(data.fromUser);

        });

        // Add a loss to the user's account
        socket.on('addLoss', function (data) {

            db.addLoss(data.fromUser);

        });


        socket.on('updateSocketIDForUser', function (data) {
            updateDictionary(data, socket.id);
        });
        
        
        
        socket.on('userLeftGame', function (data) {
            
            // todo Brian : data.fromUser left game. treat as resign
            
            onlineUsers[data.toUser].setIsInGame(false);
            onlineUsers[data.fromUser].setIsInGame(false);
            
            onlineUsers[data.toUser].setOpponent(null);
            onlineUsers[data.fromUser].setOpponent(null);
            
            // Notify opponent
            var toUserSocketID = onlineUsers[data.toUser].getSocketID();
            io.sockets.connected[toUserSocketID].emit("userLeftGame"); // second param can be an object
        });
        
        
        
        // Socket.io Event: Disconnect
        socket.on('disconnect', function () {

            var user = onlineUsers[socketIDtoUsername[socket.id]];

            if (user === undefined) {
                
                console.log("user left after server restarted. socket.on('disconnect')");
                socket.emit("_error", "sessionExpired");

            } else {
                // set user to ofline
                user.setIsOnline(false);

                // delete data if the user is not back within time
                setTimeout(function () {

                    if (!user.isOnline()) {
                        // User left (i.e. not a refresh)
                        removeUserFromDictionary(user.getUsername());
                        broadcastOnlinePlayers(socket);
                    }

                }, 1000);
            }

        });

    });

}



/**
 * This function send the list of all online players (the onlineUsers variable) to
 * all sockets that are connected.
 *
 * @param {object} socket - SocketIO object
 */
function broadcastOnlinePlayers(socket) {
    socket.emit("playerList", JSON.stringify(onlineUsers));
    socket.broadcast.emit("playerList", JSON.stringify(onlineUsers));
}



/**************************** Names for guest login ***************************/
var names = [];

function getName() {

    var name = names.shift();

    if (name === undefined) {
        names = [
            "Friendly Ape",
            "Friendly Bear",
            "Friendly Bee",
            "Friendly Bison",
            "Friendly Buffalo",
            "Friendly Butterfly",
            "Friendly Camel",
            "Friendly Caribou",
            "Friendly Cat",
            "Friendly Deer",
            "Friendly Dinosaur",
            "Friendly Eagle",
            "Friendly Falcon",
            "Friendly Giraffe",
            "Friendly Hamster",
            "Friendly Hawk",
            "Friendly Jaguar",
            "Friendly Kangaroo",
            "Friendly Koala",
            "Friendly Lion",
            "Friendly Octopus",
            "Friendly Parrot",
            "Friendly Rabbit",
            "Friendly Raccoon",
            "Friendly Ram",
            "Friendly Raven",
            "Friendly Red deer",
            "Friendly Swan",
            "Friendly Zebra"
        ];

        name = names.shift();
    }

    return name;
}
/***************************** End of guest names *****************************/



module.exports = {
    listen: listen
};
