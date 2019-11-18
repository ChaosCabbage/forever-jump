define(['settings'],
function(settings) {
    return function makeBroadcaster(yourBloke, socket) {

        var last_ping = 0;
        
        socket.on("pong", function(ms) {
            console.log("ping: " + ms + "ms")
            last_ping = ms;
        })

        function emitPos() {
            socket.emit("position", {
                x: yourBloke.x(),
                y: yourBloke.y(),
                jumpStartX: yourBloke.jumpStartX(),
                ping: last_ping
            });
        };

        var time = 0;
        return {
            update: function(seconds_elapsed) {
                time += seconds_elapsed;
                if (time > settings.ping_frequency) {
                    emitPos();
                    time -= settings.ping_frequency;
                }
            }
        }
    }
});