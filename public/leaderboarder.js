define(function() {

    return function makeLeaderBoarder(socket) {
        var leaderboard = document.getElementById("tally");
        var winners = [];
        var rank = [];
        var state = undefined;

        function toListElement(name) {
            return `<li>${name}</li>`;
        }
        function toListElements(list) {
            return list.map(toListElement).join("");
        }

        function waitingHTML() {
            return `
            <div class="waiting leaderboard">
                <h3>Awaiting Destiny</h3>
                <hr/>
                <ul id="climbers">
                    ${toListElements(rank.sort())}
                </ul>
            </div>`
        }

        function climbingHTML() {
            var climbers = rank.filter(function(name) {
                return !winners.includes(name);
            })

            return `
                <div class="leaderboard won">
                    <h2>Ascended</h2>
                    <hr/>
                    <ol id="winners">
                        ${toListElements(winners)}
                    </ol>
                </div>
                    
                <div class="climbing leaderboard">
                    <h2>Climbing</h2>
                    <hr/>
                    <ol id="climbers">
                        ${toListElements(climbers)}
                    </ol>
                </div>
                `;
        }

        function render() {
            var html = "";
            if (state === "JUMPING") {
                html = climbingHTML();
            } else {
                html = waitingHTML();
            }

            leaderboard.innerHTML = html;
        }

        socket.on("gamestate", function(gamestate) {
            winners = gamestate.winners;
            rank = gamestate.rank;
            state = gamestate.state;
        });

        render();
        setInterval(render, 500);

        socket.on("stop", function() {
            winners = [];
            render();
        });
    };
});
