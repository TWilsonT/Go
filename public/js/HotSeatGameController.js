'use strict'

class HotSeatGameController extends GameController {

	/* Inherited Variables:
	* __gameSpace
        * __view
        * __playerTurn
	* See GameController for details
	*
	*/

	constructor(){
		super();
	}

	/**
	* This method places the token on the board of this instance.
	*
	* @param {Number} player. 1 is Black and 2 is White
	* @param {Number} x - coordinate on the board.
	* @param {Number} y - coordinate on the board.
	*/
	placeToken(player, x, y){
		var validMove = this.__gameSpace.placeToken(player, x, y);

		if (validMove){
			this.__pass = false;
			this.swapTurn();
		} else {
			alert("Invalid Move!");
		}

	}
        
	/*
	*	Function Called When a Player Passes
	* 	Will End Game If Two Consecutive Passes
	*/
	pass(){
		if(this.__pass){
			this.declareWinner("none");
			this.__view.changeToReplayButtons();
			this.__gameSpace.__gameOver = true;
			//window.location.href = "winnerPage.html";//TODO: Change to Game Selection
		}else{
            console.log(this);
            this.__gameSpace.pass();
			this.__pass = true;
			this.swapTurn();
		}
	}

	resign(){
		this.__gameSpace.__gameOver = true;
		this.swapTurn();
		console.log("Resigining");
		this.declareWinner((this.__playerTurn));
	}

	end(){
		console.log("unimplemented method call"); // todo
	}

    declareWinner (winner) {
        var scores = this.__gameSpace.getScores();

        var displayPackage = {
            p1Username: 'Player One',
            p2Username: 'Player Two',
            p1Score: scores.p1Score,
            p2Score: scores.p2Score,
            winnner: winner
        };
		if(winner === "none"){
			displayPackage.winner = scores.winner === 1 ? 'Player One' : 'Player Two';

		}else{
			if(displayPackage.winner == 1){
				displayPackage.winner = "Player One";
			}else{
				displayPackage.winner = "Player Two";
			}
		}

        showWinnerNotification(displayPackage);
    }

}
