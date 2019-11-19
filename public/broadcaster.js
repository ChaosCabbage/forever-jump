define(["settings"], function(settings) {
    return function makeBroadcaster(yourBloke, socket, pingTracker) {
        function emitPos() {
            var pos = yourBloke.serialize();
            pos.ping = pingTracker.lastPing();
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
