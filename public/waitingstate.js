define(["jumpingevents", "settings"], function(makeJumpControl, settings) {
    return function createWaitingState(bloke, the_floors, death) {
        var jumpController = makeJumpControl(bloke);

        function start() {
            the_floors.length = 1;
            death_speed = 0;
            death.y = settings.death_start_y;
            jumpController.enableJumping();
        }

        function update(seconds_elapsed) {
            bloke.update(seconds_elapsed);
        }

        function unload() {
            jumpController.disableJumping();
        }

        function draw(graphics) {
            graphics.drawGiantBanner(["Gathering", "Souls"]);
        }

        return {
            start: start,
            update: update,
            unload: unload,
            draw: draw
        };
    };
});
