define(function() {
    return function makeServerRationaliser(
        otherBuggers,
        socket,
        makeBloke,
        pingTracker
    ) {
        function rationalise(serverGameState) {
            var my_ping = pingTracker.lastPing();

            for (var buggerId of Object.keys(otherBuggers)) {
                if (buggerId in serverGameState) {
                    otherBuggers[buggerId].rationalise(
                        serverGameState[buggerId],
                        my_ping
                    );
                } else {
                    delete otherBuggers[buggerId];
                }
            }

            for (var newBugger of Object.keys(serverGameState)) {
                if (!(newBugger in otherBuggers)) {
                    otherBuggers[newBugger] = makeBloke();
                }
            }
        }

        socket.on("gamestate", function(gamestate) {
            var players = gamestate.players;
            console.log("gamestate = " + JSON.stringify(gamestate));
            delete players[socket.id]; // Delete me from the list
            rationalise(players);
        });
    };
});
