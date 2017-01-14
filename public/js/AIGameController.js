'use strict'

class AIGameController extends GameController {

	/* Inherited Variables:
	* __gameSpace, __view, and __playerTurn
	* See GameController for details
	*
	* List of Variables
	* __networkAdapter		Adapter that handles all network communication.
	*
	*/

	constructor(){
		super();
		this.__networkAdapter = new NetworkAdapter();
	}

	placeToken(player, x, y){

        if (this.__view.isLocked() === false) {

            var _this = this;

            var moveAccepted = this.__gameSpace.placeToken(this.__playerTurn, x, y);

            if (moveAccepted){
				this.__historySpot += 1;
                this.__view.lockControls();

                this.swapTurn()

                // Fixing for the AI coordinates
                var lastMove = this.convertToAICoordinate( this.__gameSpace.getLastMove() );

                //  request server for AI move
                this.__networkAdapter.getAIMove(this.__gameSpace.size, this.__gameSpace.getGrid(), lastMove, function(res){

                    var aiMove = JSON.parse(res);

                    // Fixing for the AI coordinates
                    var aiMove = _this.convertToLocalCoordinate( aiMove );

                    if(aiMove.pass){
                        // AI passed
                        _this.__pass = true;
                        alert("The AI passed");
                        console.log("The AI passed"); // todo the ai passed. notify the user
                    } else {

                        var aiValid = _this.__gameSpace.placeToken(aiMove.c, aiMove.x, aiMove.y);

                        if (!aiValid){
                            // AI's move was not accepted by the placeToken() method
                            console.log("AI made an invalid move");
                            console.log(aiMove);
                        }
                    }

                    // Draw the AI made move and unlock controls
                    _this.swapTurn();
                    _this.__view.draw();
                    _this.__view.unlockControls();
                });

            } else {
                alert("Invalid Move!");
            }
        } else {
            console.log("Controls are locked, it's not your turn");
        }

    }

	pass(){

        if (this.__view.isLocked() === false) {



            var _this = this;
            if(this.__pass){
                this.declareWinner();
            }else{
                this.__gameSpace.pass();
                this.__networkAdapter.getAIMove(this.__gameSpace.size, this.__gameSpace.getGrid(), this.__gameSpace.getLastMove(), function(res){

                    var aiMove = JSON.parse(res);
                    console.log(aiMove);

                    if(aiMove.pass){
                        _this.declareWinner();
                        _this.__view.changeToReplayButtons(); // todo throwing errors in the console
                        _this.__gameSpace.__gameOver = true;
                    } else {
                        var aiValid = _this.__gameSpace.placeToken(aiMove.c, aiMove.y, aiMove.x); // temporary fix: x=y and y=x
                        if (!aiValid){
                            // AI's move was not accepted by the placeToken() method
                            log("AI made an invalid move");
                        }
                    }

                    // Draw the AI made move and unlock controls
                    _this.swapTurn
                    _this.__view.draw();
                    _this.__view.unlockControls();
                });
            };
        } else {
            console.log("Controls are locked, it's not your turn");
        }

	}

	resign(){
		this.__gameSpace.__gameOver = true;
		this.swapTurn();
		console.log("Resigining");
		this.declareWinner((this.__playerTurn));
	}

	end(){
		console.log("unimplemented method call");
	}

    declareWinner () {
        var scores = this.__gameSpace.getScores();

        var displayPackage = {
            p1Username: 'Player',
            p2Username: 'Computer',
            p1Score: scores.p1Score,
            p2Score: scores.p2Score,
            winnner: null
        };

        displayPackage.winner = scores.winner ='Computer';

        showWinnerNotification(displayPackage);
    }

    /**
     * This function takes the last move and convert coordinates to match the AI server.
     * For the current implementation of the AI server: x and y are flipped
     *
     * @param {object} lastMove - the last made move.
     * lastMove = {
     *      x: number,
     *      y: number,
     *      c: number,
     *      pass: boolean
     *   }
     */
    convertToAICoordinate(lastMove){

        // Swapping (x,y) coordinate to match AI server
        var temp = lastMove.x;
        lastMove.x = lastMove.y;
        lastMove.y = temp;

        return lastMove;
    }

    /**
     * This function converts the received move from the AI server
     * to match the local board implementation.
     *
     * For the current implementation of the AI server: x and y are flipped
     *
     * @param {object} receivedMove - the move object that is received from the AI server
     */
    convertToLocalCoordinate(receivedMove){

         // Swapping (x,y) coordinate to match AI server
        var temp = receivedMove.x;
        receivedMove.x = receivedMove.y;
        receivedMove.y = temp;

        return receivedMove;

    }

}
