define(["parabola", "floorgeneration", "settings", "random"], function(
    makeParabola,
    floorGen,
    settings,
    makeGenerator
) {
    function createJumpParabola(start_position, direction) {
        return makeParabola(
            start_position,
            { x: settings.x_speed * direction, y: settings.jump_speed },
            settings.gravity
        );
    }

    function makeFloorGenerator(settings, floors, stage_limits, random_seed) {
        var generator = makeGenerator(random_seed);

        function generateNewFloor(previous_floor, direction) {
            var new_floor = floorGen(
                settings,
                previous_floor,
                createJumpParabola({ x: 0, y: 0 }, direction),
                direction,
                stage_limits,
                generator
            );

            return new_floor.floor;
        }

        var floor_generation_direction = 1;

        function generateFloorsUpTo(final_y) {
            var latest_floor = floors[floors.length - 1];
            if (latest_floor.y > final_y) {
                return;
            }

            var floor = generateNewFloor(
                latest_floor,
                floor_generation_direction
            );
            floors.push(floor);

            if (
                floor.right == stage_limits.right ||
                floor.left == stage_limits.left
            ) {
                floor_generation_direction *= -1;
            }

            generateFloorsUpTo(final_y);
        }

        return {
            generateFloorsUpTo: generateFloorsUpTo
        };
    }

    return function createState(
        settings,
        bloke,
        death,
        the_floors,
        stage_limits,
        switchToDeathState,
        maxVisibleY,
        random_seed
    ) {
        var floor_generator = makeFloorGenerator(
            settings,
            the_floors,
            stage_limits,
            random_seed
        );
        var death_speed = settings.death_speed;

        function update(seconds_elapsed) {
            bloke.update(seconds_elapsed);
            death.y += death_speed * seconds_elapsed;

            if (death.y > bloke.y()) {
                switchToDeathState();
                return;
            }

            floor_generator.generateFloorsUpTo(maxVisibleY());
        }

        function preventEvent(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        }

        function doJump(evt) {
            bloke.jump();
            return preventEvent(evt);
        }

        function doJumpOnSpace(evt) {
            if (evt.keyCode == 32) {
                doJump(evt);
            }
        }

        function start() {
            floor_generator.generateFloorsUpTo(maxVisibleY());

            window.addEventListener("keydown", doJumpOnSpace, false);
            window.addEventListener("touchstart", doJump, false);

            window.addEventListener("click", preventEvent, false);
            window.addEventListener("touchend", preventEvent, false);
            window.addEventListener("touchmove", preventEvent, false);
            window.addEventListener("scroll", preventEvent, false);
        }

        function unload() {
            window.removeEventListener("keydown", doJumpOnSpace);
            window.removeEventListener("touchstart", doJump);

            window.removeEventListener("click", preventEvent);
            window.removeEventListener("touchend", preventEvent);
            window.removeEventListener("touchmove", preventEvent);
            window.removeEventListener("scroll", preventEvent);
        }

        return {
            start: start,
            update: update,
            unload: unload
        };
    };
});
