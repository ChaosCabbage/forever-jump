requirejs(
    [
        "draw",
        "waitingstate",
        "jumpingstate",
        "deathstate",
        "bloke",
        "settings",
        "broadcaster",
        "rationalise",
        "pingTracker",
        "querystring",
        "leaderboarder"
    ],
    function(
        graphics,
        makeWaitingState,
        makeJumpState,
        makeDeathState,
        makeBloke,
        settings,
        makeBroadcaster,
        startServerRationaliser,
        makePingTracker,
        parseQuery,
        makeLeaderboarder
    ) {
        var session = undefined;

        var query_pars = parseQuery();
        var your_name = query_pars.name || "Nop";
        your_name = decodeURIComponent(your_name).replace("+", " ");

        var socket = io();

        var pingTracker = makePingTracker(socket);
        makeLeaderboarder(socket);

        var stage_limits = {
            left: 20,
            right: graphics.size.width() - 20
        };

        var max_score = 0;

        var scoreRef = {
            maxScore: function() {
                return Math.floor(max_score);
            }
        };

        var the_floors = [
            { left: 0, right: graphics.size.width(), y: settings.first_floor_y }
        ];

        var makeBlokeWithCurrentSettings = function(name) {
            return makeBloke(settings, the_floors, stage_limits, name);
        };

        var bloke = makeBlokeWithCurrentSettings(your_name);

        var broadcaster = makeBroadcaster(bloke, socket, pingTracker, scoreRef);

        var death = {
            y: settings.death_start_y
        };

        var otherBuggers = {};
        var applyUpdatesFromServer = startServerRationaliser(
            otherBuggers,
            socket,
            makeBlokeWithCurrentSettings,
            pingTracker
        );
        function forEachOtherBugger(fn) {
            for (var key of Object.keys(otherBuggers)) {
                fn(otherBuggers[key]);
            }
        }

        function viewport_y() {
            return Math.max(0, bloke.y() - 200);
        }

        function currentScore() {
            return bloke.y() - settings.first_floor_y;
        }

        function getCurrentPercentCompletion() {
            if (session && session.goal) {
                return (currentScore() / session.goal) * 100;
            }
            return undefined;
        }
        function getMaxPercentCompletion() {
            if (session && session.goal) {
                return (max_score / session.goal) * 100;
            }
            return undefined;
        }

        var state = undefined;

        function draw() {
            var view = viewport_y();
            graphics.wipe("AntiqueWhite");
            graphics.drawWalls();
            forEachOtherBugger(function(other) {
                graphics.drawBlokeWithName(other, view, "gray");
            });
            graphics.drawBloke(bloke, view);
            the_floors.forEach(function(floor) {
                graphics.drawFloor(floor, view);
            });
            graphics.drawDeathLine(death.y, view);

            var maxPercent = getMaxPercentCompletion();
            if (maxPercent !== undefined) {
                graphics.drawMaxPercentage(maxPercent);
            }

            var percentage = getCurrentPercentCompletion();
            if (percentage !== undefined) {
                graphics.drawHeight(percentage);
            }

            if (state.draw) {
                state.draw(graphics);
            }
        }

        function switchState(new_state) {
            if (state) {
                state.unload();
            }
            state = new_state;
            state.start();
        }

        function createDeathState() {
            var switchToJumpingState = function() {
                switchState(createJumpingState());
            };
            return makeDeathState(
                settings,
                the_floors,
                death,
                bloke,
                switchToJumpingState
            );
        }

        function createJumpingState() {
            var maxVisibleY = function() {
                return graphics.size.height() + viewport_y();
            };
            var switchToDeathState = function() {
                switchState(createDeathState());
            };
            return makeJumpState(
                settings,
                bloke,
                death,
                the_floors,
                stage_limits,
                switchToDeathState,
                maxVisibleY,
                session
            );
        }

        function createWaitingState() {
            return makeWaitingState(bloke, the_floors, death, socket);
        }

        function init() {
            switchState(createWaitingState());
            socket.on("begin", function(gameSettings) {
                max_score = 0;
                session = gameSettings;
                switchState(createJumpingState());
            });
            socket.on("stop", function() {
                max_score = 0;
                switchState(createWaitingState());
            });
        }

        function update(seconds_elapsed) {
            applyUpdatesFromServer();
            state.update(seconds_elapsed);
            forEachOtherBugger(function(other) {
                other.update(seconds_elapsed);
            });
            broadcaster.update(seconds_elapsed);
            max_score = Math.max(max_score, currentScore());
            draw();
        }

        function start() {
            init();

            var previous_time = null;
            function step(timestamp) {
                if (!previous_time) {
                    previous_time = timestamp;
                }
                var ms_elapsed = timestamp - previous_time;
                var seconds_elapsed = ms_elapsed / 1000;

                update(seconds_elapsed);

                previous_time = timestamp;
                window.requestAnimationFrame(step);
            }
            window.requestAnimationFrame(step);
        }

        start();
    }
);
