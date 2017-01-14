'use strict'

/* List of variables:
*
* __username			- The name of the user. Only set once by the constructor
* __opponent			- The name of the opponent.
* __socketid			- Socket ID
*
*
*/

/* List of methods:
*
* constructor			- for the User object
*
* +----------------------------------------------------------------------------+
* | Getters						| Setters
* +----------------------------------------------------------------------------+
* | 							| sentGameRequestTo
* | getUsername					|
* | getOpponent					| setOpponent
* | getSocketid					| setSocketid
* +----------------------------------------------------------------------------+
*
*/

class User {

    constructor(username){
        this.__username = username;
        this.__opponent = null

        this.__requestSentList = {};
        this.__requestReceivedList = {};

        this.__socketid = null
        this.__isOnline = true;
        this.__boardSize = 0;
        this.__isInGame = false;
        this.__playerNumber = null;
    }

        getUsername(){
            return this.__username;
        }

        setOpponent(opponent){
            this.__opponent = opponent;
        }

        getOpponent(){
            return this.__opponent;
        }

        setSocketID(socketid){
            this.__socketid = socketid;
        }

        getSocketID(){
            return this.__socketid;
        }

        addToRequestSentList(username){
            this.__requestSentList[username] = "pending";
        }
        
        removeFromRequestSentList(username){
            delete(this.__requestSentList[username]);
        }

        getRequestSentList(){
            return this.__requestSentList;
        }
        
        addToRequestReceivedList(fromUser, boardSize){
            this.__requestReceivedList[fromUser] = boardSize;
        }
        
        removeFromRequestReceivedList(fromUser){
            delete(this.__requestReceivedList[fromUser]);
        }
        
        getRequestReceivedList(){
            return this.__requestReceivedList;
        }

        updateRequestStatus(toUser, newStatus){
            this.__requestSentList[toUser] = newStatus;
        }

        setIsOnline(isOnline){
            this.__isOnline = isOnline;
        }

        isOnline(){
            return this.__isOnline;
        }

        setBoardSize(size){
            this.__boardSize = size;
        }

        getBoardSize(){
            return this.__boardSize;
        }

        setIsInGame(isInGame){
            this.__isInGame = true;
        }

        getIsInGame(){
            return this.__isInGame;
        }

        setPlayerNumber(number){
            this.__playerNumber = number;
        }

        getPlayerNumber(){
            return this.__playerNumber;
        }

}

module.exports = User;
