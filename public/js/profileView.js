var socket = io();

var user;

// Reason for having this: the server will register the socket id
socket.emit("userdataForUsername", sessionStorage.username);

if (sessionStorage.isGuest === "false") {
    // user logged in using username and password
    // therefore, request user data
    userWL(sessionStorage.username);
} 

function userWL(username) {


  (new NetworkAdapter()).userWinLoss(username, onRes);

  function onRes(success, data) {
    username = 'Welcome, ' + username;
    $(".welcome-message").append(username);
    var games =  $(".games-played");
    var wins = $(".wins");
    var losses = $(".losses");
    var winRate = $(".win-rate");

    if(success) {
      console.log('onRes was successful');
      console.log(data);
      var totalGames = (data.wins + data.losses);
      if(totalGames === 0) {
        var winRatePercnt = 0
      }
      else {
        var winRatePercnt = (data.wins/totalGames);
      }

      games.append(totalGames);
      wins.append(data.wins);
      losses.append(data.losses);
      winRate.append(winRatePercnt + '%');

    }
    else {
      console.log('onRes was failed');

      games.append('n/a');
      wins.append('n/a');
      losses.append('n/a');
      winRate.append('n/a');
    }
  }
}


function changePassword() {
  password = $('#sample3').val();
  console.log(password);
  username = sessionStorage.username;
  (new NetworkAdapter()).updatePassword(password, username, onRes);

  function onRes(success, data) {

    if(success) {
      $('#sample3').html('');
      $('#sample2').html('');
      alert('Password Updated');
    }
    else {
      $('#sample3').html('');
      $('#sample2').html('');
      alert('Password update Failed sorry we are shit programmers');
    }
  }
}




function routeGameSelect() {
  window.location.href = "/gameSelect.html";
}
