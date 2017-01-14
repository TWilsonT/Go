var User = require("./User.js");

//load the mongoose module
var mongoose = require('mongoose');

//connect to database using the DB server URL.
mongoose.connect('mongodb://localhost:27017/my_database_name');

//define Model for User entity. This model represents a collection in the database.
//define the possible schema of User document and data types of each field.
var Userdb = mongoose.model('Userdb', {username: String, password: String, security: String, wins: Number, losses: Number});

/**
 *
 * @param {string} username
 * @param {string} password
 * @returns {boolean} true if username and password is correct
 */
function authenticateUser(username, password, fn) {
    Userdb.findOne({username: username, password: password}, function (err, userObj) {

    if (err) {

      console.log(err);
    }

    userObj ? fn(true) : fn(false)

  });
}

/**
 *
 * @param {string} username
 * @returns {object} user's data from the db (must abide the server side User data structure)
 */
function getUserData(username) {

    // query for user data

    var u = new User(username);

    // todo delete
    // for dev purposes
    return u;
}

function incrementWins(username) {


    var query = {username: username}

    Userdb.findOne(query, function (err, userObj) {

        if (err){
            console.log(err);
        }

        if (userObj) {

            Userdb.update(query, { $set: { wins: userObj.wins + 1 }}, function(){

                console.log("updated " + username + "'s wins");

            });

        }
    });
}

function incrementLosses(username) {


    var query = {username: username}

    Userdb.findOne(query, function (err, userObj) {

        if (err){
            console.log(err);
        }

        if (userObj) {

            Userdb.update(query, { $set: { losses: userObj.losses + 1 }}, function(){

                console.log("updated " + username + "'s losses");

            });

        }
    });
}

function registerUser(username, password, security, fn) {

    var new_user = new Userdb({username: username, password: password, security: security, wins: 0, losses: 0});

    new_user.save(function (err, userObj) {

      if (err) {

        console.log(err);
        fn(false);

      } else {

        console.log('saved successfully:', userObj);
        fn(true);

      }
    });
}
// to do : all this down hurr
function uniqueUser(username, fn) {

  Userdb.findOne({username: username}, function (err, userObj) {

    if(err)

      console.log(err);

      userObj ? fn(true) : fn(false)

  });
}

function getWinLoss(username, fn) {
  Userdb.findOne({username: username}, 'wins losses', function(err, userObj) {
    if(err) {

        console.log(err);

        fn(false, null);
    }

    else if(userObj){

        var result = {wins: userObj.wins, losses: userObj.losses};

        fn(true, result);

    }
  });
}

function updatePassword(newPassword, username, fn) {

  var query = {username: username}

  Userdb.findOne(query,  function (err, userObj) {

      if (err){
          console.log(err);
      }

      if (userObj) {

          Userdb.update(query, { $set: { password: newPassword}}, function(){

              console.log("updated password for: " + username);
              fn(true);

          });

      }
  });

}
/*
 * other functions to query the database as needed
 * /

 /*
 * function example(){
 *      ...
 * }
 *
 */

module.exports = {
    authenticate: authenticateUser,
    getUserData: getUserData,
    register: registerUser,
    winLoss: getWinLoss,
    addWin: incrementWins,
    addLoss: incrementLosses,
    updatePass: updatePassword // ,
            // example : example
            // ...

};
