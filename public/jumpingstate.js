define([
    "parabola",
    "floorgeneration",
    "settings",
    "random",
    "jumpingevents"
], function(makeParabola, floorGen, settings, makeGenerator, makeJumpControl) {
    function createJumpParabola(start_position, direction) {
        return makeParabola(
            start_position,
            { x: settings.x_speed * direction, y: settings.jump_speed },
            settings.gravity
        );
    }

    function makeFloorGenerator(
        settings,
        floors,
        stage_limits,
        random_seed,
        goal_y
    ) {
        var generator = makeGenerator(random_seed);

        function generateNewFloor(previous_floor, direction) {
            var new_floor = floorGen(
                settings,
                previous_floor,
                createJumpParabola({ x: 0, y: 0 }, direction),
                direction,
                stage_limits,
                generator,
                goal_y
            );

            return new_floor.floor;
        }

        var floor_generation_direction = 1;

        function generateFloorsUpTo(final_y) {
            var latest_floor = floors[floors.length - 1];
            if (latest_floor.y > final_y) {
                return;
            }

            if (latest_floor.y > goal_y) {
                floors.pop();
                floors.push({
                    left: stage_limits.left,
                    right: stage_limits.right,
                    y: goal_y
                });
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
        goal_y,
        random_seed
    ) {
        var floor_generator = makeFloorGenerator(
            settings,
            the_floors,
            stage_limits,
            random_seed,
            goal_y
        );
        var death_speed = settings.death_speed;

        var jumpController = makeJumpControl(bloke);

        function update(seconds_elapsed) {
            bloke.update(seconds_elapsed);
            death.y += death_speed * seconds_elapsed;

            if (death.y > bloke.y()) {
                switchToDeathState();
                return;
            }

            floor_generator.generateFloorsUpTo(maxVisibleY());
        }

        function start() {
            floor_generator.generateFloorsUpTo(maxVisibleY());
            jumpController.enableJumping();
        }

        function unload() {
            jumpController.disableJumping();
        }

        return {
            start: start,
            update: update,
            unload: unload
        };
    };
});
