define(function() {
    return function makePingTracker(socket) {
        var last_ping = 0;

        socket.on("pong", function(ms) {
            console.log("ping: " + ms + "ms");
            last_ping = ms;
        });

        return {
            lastPing: function() {
                return last_ping;
            }
        };
    };
});
