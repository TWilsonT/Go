'use strict'
/******************
*
*   This class represents the game board as an array of arrays containing:
*           0 - Unoccupied
*       1 - Player 1 Token
*       2 - Player 2 Token
*   It is also used to represent a "visited" matrix of the board for a DFS
*   algorithm used to count liberties and identify armies.  Each space contains
*   either:
*       0 - Not visited
*       1 - Visited
*   EX. Gameboard
*       |-0-|-1-|-2-|-3-|-4-|x
*    -0-| 0 | 0 | 1 | 0 | 0 |
*    -1-| 0 | 0 | 2 | 1 | 2 |
*    -2-| 0 | 0 | 0 | 2 | 1 |
*    -3-| 0 | 0 | 2 | 0 | 2 |
*    -4-| 0 | 0 | 0 | 2 | 0 |
*     y
*     EX. Visited
*        -0-|-1-|-2-|-3-|-4-|x
*    -0-| 0 | 0 | 1 | 0 | 0 |
*    -1-| 0 | 1 | 1 | 1 | 1 |
*    -2-| 0 | 0 | 1 | 0 | 1 |
*    -3-| 0 | 1 | 1 | 0 | 1 |
*    -4-| 0 | 0 | 1 | 1 | 0 |
*     y
*     The above is printed by the .print() method
*
*/

class GameBoard {

    /*
    Attributes:
        grid - an array of arrays of size [n][n]
        size - the length of the boards axis
    */

    //  constructor
    //      Params:
    //          size - size of the board
    constructor (size) {

        var i,j;
        var grid = [];

        //Initialize each space to 0
        for (i=0; i<size; i++) {

            var row = [];

            for (j=0; j<size; j++) {
                row.push(0);
            }

            grid.push(row);
        }

        this.grid = grid;
        this.size = size;

    }

    //  get
    //      Params
    //          x - x coordinate
    //          y - y coordinate
    //      Returns 0, 1, or 2
    get (x, y) {
        return this.grid[y][x];
    }

    // getBoard
    //      Returns The entire board array
    getGrid () {
        return this.grid;
    }

    //  get
    //      Params
    //          val - 0, 1, or 2, the p
    //          x - x coordinate
    //          y - y coordinate
    set (val, x, y) {
        this.grid[y][x] = val;
    }

    //  removeTokens
    //      Params:
    //          tokens - array of {x,y} pairs
    removeTokens (tokens) {

        var that = this;

        tokens.forEach(function (token) {
            that.set(0, token.x, token.y);
        })
    }

    //  clone
    //      Returns a new GameBoard object, identical to this one
    clone () {

        var newBoard = new GameBoard(this.size);
        var i,j;

        for (i=0; i<this.size; i++) {
            for (j=0; j<this.size; j++) {
                newBoard.set(this.get(i, j), i, j);
            }
        }

        return newBoard;
    }

    // placeToken
    //
    //      counts the number of tokens belonging to player
    //
    //      Params:
    //          player - the player who's tokens are being counted
    //      Returns: the number of tokens belonging to the player
    count (player) {

        var i,j;
        var count = 0

        for (i=0; i<this.size; i++) {
            for (j=0; j<this.size; j++) {
                if(this.get(i,j) === player){
                    count++;
                }
            }
        }
        return count;
    }

    //  opposingPlayer
    //      Params:
    //          player - 1 or 2, whoever's turn it is
    //      Returns: 1 or 2, the opposing player's number
    __opposingPlayer (player) {

        if (player === 1) {
            return 2;
        }
        else {
            return 1;
        }
    }

    //  countSpaceLiberties
    //      Params:
    //          player - the player placing a token
    //          x - the x-coordinate where the player is trying to place a token
    //          y - the y-coordinate
    //      Returns: the number of liberties the space has, including friendly
    //          armies
    __countSpaceLiberties (player, x, y) {

        var liberties = 0
        var opponent = this.__opposingPlayer(player);

        if (x - 1 > -1 && this.get(x - 1, y) != opponent) {
            liberties += 1;
        }
        if (y - 1 > -1 && this.get(x, y - 1) != opponent) {
            liberties += 1;
        }
        if (x + 1 < this.size && this.get(x + 1, y) != opponent) {
            liberties += 1;
        }
        if (y + 1 < this.size && this.get(x, y + 1) != opponent) {
            liberties += 1;
        }

        return liberties;
    }

    //  countArmyLibertiesDFS
    //
    //      This is a recursive DFS algorithm that counts the liberties of an
    //      army.
    //
    //      Params:
    //          player - 1 or 2, the player who owns the army
    //          x - the x-coordinate where the player is trying to place a token
    //          y - the y-coordinate
    //          visited - a GameBoard object where visited spaces are marked 1
    //      Return the number of liberties the army starting at (x,y) has
    __countArmyLibertiesDFS (player, x, y, visited) {

        var liberties = 0;
        var opponent = this.__opposingPlayer(player);

        //If
        //  1) This space has been visited
        //  2) This space belongs to the current player
        //Then don't count its liberties towards the total
        if (visited.get(x, y) === 1 || this.get(x, y) === opponent) {
            return 0;
        }

        //Mark as Visited
        visited.set(1, x, y);

        //If This space is unoccupied
        //Then Return 1 Liberty
        if (this.get(x, y) === 0) {
            return 1;
        }

        //If adjacent square is not off the board
        //Then check who it belongs to and add their liberties to the total
        if (x - 1 > -1) {
            liberties += this.__countArmyLibertiesDFS(player, x-1, y, visited);
        }
        if (y - 1 > -1) {
            liberties += this.__countArmyLibertiesDFS(player, x, y-1, visited);
        }
        if (x + 1 < this.size) {
            liberties += this.__countArmyLibertiesDFS(player, x+1, y, visited);
        }
        if (y + 1 < this.size) {
            liberties += this.__countArmyLibertiesDFS(player, x, y+1, visited);
        }

        //Return the Liberties of all adjacent, non-visted spaces
        return liberties;
    }

    //  countArmyLiberties
    //      Params:
    //          player - 1 or 2, the player owning the army
    //          x - the x-coordinate where the player is trying to place a token
    //          y - the y-coordinate
    //      Return the TOTAL number of liberties the army including (x,y) has
    __countArmyLiberties (player, x, y) {

        var visited = new GameBoard(this.size);

        return this.__countArmyLibertiesDFS(player, x, y, visited);
    }

    //  isArmyDestroyed
    //
    //      Params:
    //          player - player owning the army at (x,y)
    //          x - the x-coordinate of a opponent's token
    //          y - the y-coordinate
    //      Returns:
    //          True if the army is destroyed by this move
    //          False otherwise
    __isArmyDestroyed (player, x, y) {

        var visited = new GameBoard(this.size);

        if (this.__countArmyLibertiesDFS (player, x, y, visited) === 0) {
            return true;
        }
        else {
            return false;
        }
    }

    //  getArmyCoordsDFS
    //
    //      This is a recursive DFS algorithm that gets the coordinates of each
    //      token in an army, returning them in post-order.
    //
    //      Params:
    //          player - player who owns the army being located
    //          x - the x-coordinate where the player is placing a token
    //          y - the y-coordinate
    //          visited - a GameBoard object where visited spaces are marked 1
    //          army - an array of objects containing token coordinates
    //      Return the army array
    __getArmyCoordsDFS (player, x, y, visited, army) {

        var token = {
            x: x,
            y: y
        }

        //If this space has been visited then return
        if (visited.get(x, y) === 1) {
            return army;
        }

        //Mark as Visited
        visited.set(1, x, y);

        //If this space doesn't belong to the army
        //Then return
        if (this.get(x, y) !== player) {
            return army;
        }

        //Add the token's coordinates to the army
        army.push(token);

        //If adjacent square is not off the board
        //Then check who it belongs to and add their liberties to the total
        if (x-1 > -1) {
            this.__getArmyCoordsDFS (player, x-1 , y, visited, army);
        }
        if (y-1 > -1) {
            this.__getArmyCoordsDFS (player, x, y-1, visited, army);
        }
        if (x+1 < this.size) {
            this.__getArmyCoordsDFS (player, x+1, y, visited, army);
        }
        if (y+1 < this.size) {
            this.__getArmyCoordsDFS (player, x, y+1, visited, army);
        }

        //Return the token array
        return army;
    }

    //  getArmyCoords
    //
    //      This is a recursive DFS algorithm that gets the coordinates of each
    //      token in an army, returning them in post-order.
    //
    //      Params:
    //          player - player owning the army at (x,y)
    //          x - the x-coordinate where the player is placing a token
    //          y - the y-coordinate
    //      Return an array of objects containing the coordinates of each token
    //          in the army
    __getArmyCoords (player, x, y) {

        var visited = new GameBoard(this.size);
        var tokens = [];

        return this.__getArmyCoordsDFS(player, x, y, visited, tokens);
    }

    //  evaluateMove
    //
    //      This function evalutates the change in the board made by placing
    //      a token, including destroying armies.  Used to check if a move
    //      reverts the board, and to update the gameboard.
    //
    //      Params:
    //          player - the player placing a token
    //          x - the x-coordinate where the player is placing a token
    //          y - the y-coordinate
    evaluateMove (player, x, y) {

        var armiesDestroyed = [];
        var opponent = this.__opposingPlayer(player);

        var visited = new GameBoard(this.size);

        this.set(player, x, y);

        if (x - 1 > -1 && this.__isArmyDestroyed (opponent, x-1, y)) {
            this.__getArmyCoordsDFS(opponent, x-1, y, visited, armiesDestroyed);
        }
        if (y - 1 > -1 && this.__isArmyDestroyed (opponent, x, y-1)) {
            this.__getArmyCoordsDFS(opponent, x, y-1, visited, armiesDestroyed);
        }
        if (x + 1 < this.size && this.__isArmyDestroyed (opponent, x+1, y)) {
            this.__getArmyCoordsDFS(opponent, x+1, y, visited, armiesDestroyed);
        }
        if (y + 1 < this.size && this.__isArmyDestroyed (opponent, x, y+1)) {
            this.__getArmyCoordsDFS(opponent, x, y+1, visited, armiesDestroyed);
        }

        this.removeTokens(armiesDestroyed);
    }

    //  getRowHeader
    //      Returns - String of this board header, the x-axis numbers
    __getRowHeader () {

        var string = "   |";
        var i;

        this.grid.forEach(function (column, index) {
            string += "-" + index + "-|";
        });

        return string;
    }

    //  getRowString
    //      Returns - String of this row of the board, human readable
    __getRowString (row) {

        var string = "-" + row + "-|";
        var i;

        this.grid[row].forEach(function (space) {
            string += " " + space + " |";
        });

        return string;
    }

    //  print
    //      Prints the game board to the console in human readable format
    print () {

        var that = this;

        console.log(this.__getRowHeader());
        this.grid.forEach(function (row, index, grid) {
            console.log(that.__getRowString(index));
        })
    }

    //  equal
    //      Params:
    //          b1, b2 - GameBoard Objects
    //      Returns:
    //          True if the GameBoards are identical
    //          False Otherwise
    static equal(b1, b2) {

        var i,j;

        if (b1.size != b2.size) {
            console.log('b1 and b2 are of different sizes');
            return false;
        }

        for (i=0; i<b1.size; i++) {

            for (j=0; j<b1.size; j++) {

                if (b1.get(i, j) !== b2.get(i, j)) {
                    return false;
                }
            }
        }

        console.log('b1 and b2 are equal');
        return true;
    }
}
