define(function() {
    return function makeServerRationaliser(
        otherBuggers,
        socket,
        makeBloke,
        pingTracker
    ) {
        function rationalise(players) {
            var my_ping = pingTracker.lastPing();

            for (var buggerId of Object.keys(otherBuggers)) {
                if (buggerId in players) {
                    otherBuggers[buggerId].rationalise(
                        players[buggerId],
                        my_ping
                    );
                } else {
                    delete otherBuggers[buggerId];
                }
            }

            for (var newBugger of Object.keys(players)) {
                if (!(newBugger in otherBuggers)) {
                    otherBuggers[newBugger] = makeBloke(players[newBugger].name);
                }
            }
        }

        var players = undefined;

        socket.on("gamestate", function(gamestate) {
            players = gamestate.players;
            console.log("gamestate = " + JSON.stringify(gamestate));
            delete players[socket.id]; // Delete me from the list
        });

        return function update() {
            if (players) {
                rationalise(players);
            }
            players = undefined;            
        }
    };
});
