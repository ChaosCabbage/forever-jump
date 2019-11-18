define(function() {
    return function makeServerRationaliser(otherBuggers, socket, makeBloke) {
        
        function rationalise(serverGameState) {
            for (var buggerId of Object.keys(otherBuggers)) {
                if (buggerId in serverGameState) {
                    otherBuggers[buggerId].rationalise(serverGameState[buggerId])
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
            delete gamestate[socket.id] // Delete me from the list
            console.log("gamestate = " + JSON.stringify(gamestate))
            rationalise(gamestate);
        });        
    }
})