class GameSocket {

    /* List of variables
    *
    * __socket  - established socket with the server.
    *   A Socket.io object. Use setSocket()
    *
    */

	constructor (gameController, socket) {

        this.__gameController = gameController;
        this.__socket = socket;

        var that = this;
        // Event: Client receives a move from the opponent
        this.__socket.on('move', function (data) {

                that.__gameController.receiveMove(data.move);

        });

        this.__socket.on('resign', function (data) {

            that.__gameController.receiveResign();

        });

        this.__socket.on('gameOver', function (data) {

            that.__gameController.receiveGameOver();

        });
    }

    emit (channel, data) {

        var emitData = data || {};

        emitData.fromUser = user.__username;
        emitData.toUser = user.__opponent;

        this.__socket.emit(channel, emitData);
    }
}
