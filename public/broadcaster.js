define(["settings"], function(settings) {
    return function makeBroadcaster(yourBloke, socket, pingTracker, scoreRef) {
        function emitPos() {
            var pos = yourBloke.serialize();
            pos.ping = pingTracker.lastPing();
            pos.score = scoreRef.maxScore();
            socket.emit("position", pos);
        }

        var time = 0;
        return {
            update: function(seconds_elapsed) {
                time += seconds_elapsed;
                if (time > settings.ping_frequency) {
                    emitPos();
                    time -= settings.ping_frequency;
                }
            }
        };
    };
});
