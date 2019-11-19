define(function() {
    return function makeLeaderBoarder(socket) {
        var leaderboard = document.getElementById("leaderboard");
        var winners = [];
        function render() {
            var html = "<ol>";
            for (var name of winners) {
                html += "<li>" + name + "</li>";
            }
            html += "</ol>";
            leaderboard.innerHTML = html;
        }

        socket.on("gamestate", function(gamestate) {
            winners = gamestate.winners;
        });

        setInterval(render, 1000);

        socket.on("stop", function() {
            winners = [];
            render();
        });
    };
});
