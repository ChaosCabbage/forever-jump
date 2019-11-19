define(function() {
    function collidesWithFloor(floor, previous_pos, new_pos) {
        // Perform a straight line collision test.
        // Maybe I'll work my lovely parabolas in here eventually :(

        var t = (floor.y - previous_pos.y) / (new_pos.y - previous_pos.y);
        if (t < 0 || t > 1) {
            return false;
        }
        var x = t * new_pos.x + (1 - t) * previous_pos.x;

        return x >= floor.left && x <= floor.right;
    }

    // Return the floor collided with, or null.
    function collideFloors(floors, previous_pos, new_pos) {
        for (var i = 0; i < floors.length; ++i) {
            var floor = floors[i];
            if (collidesWithFloor(floor, previous_pos, new_pos)) {
                return floor;
            }
        }
        return null;
    }

    return function makeBloke(
        jump_settings,
        floors,
        stage_limits,
        name = "Monmouth"
    ) {
        var man_halfwidth = 5;

        var _current_direction = 1;

        var _x = (stage_limits.right + stage_limits.left) / 2;
        var _y = jump_settings.first_floor_y;

        var _y_velocity = 0;

        var _name = name;

        var pos = function() {
            return { x: _x, y: _y };
        };

        var touchingWall = function(x) {
            return (
                x <= stage_limits.left + man_halfwidth ||
                x >= stage_limits.right - man_halfwidth
            );
        };

        var collideWithWall = function(x) {
            var new_x = Math.max(x, stage_limits.left + man_halfwidth);
            new_x = Math.min(new_x, stage_limits.right - man_halfwidth);
            return new_x;
        };

        var jumpCollision = function(new_pos) {
            if (_y_velocity > 0) {
                return null; // Pass through floors while moving upwards
            }
            return collideFloors(floors, pos(), new_pos);
        };

        var onSolidGround = function() {
            var test_pos = { x: _x, y: _y - 10 };
            return jumpCollision(test_pos) != null;
        };

        var update = function(seconds_elapsed) {
            _y_velocity -= seconds_elapsed * jump_settings.gravity;

            var new_x =
                _x +
                seconds_elapsed * jump_settings.x_speed * _current_direction;
            var new_y = _y + seconds_elapsed * _y_velocity;

            var collided_floor = jumpCollision({ x: new_x, y: new_y });
            if (collided_floor) {
                _y_velocity = 0;
                new_y = collided_floor.y;
            }

            _x = new_x;
            _y = new_y;

            if (touchingWall(_x)) {
                _x = collideWithWall(_x);
                _current_direction *= -1;
            }
        };

        var rationalise = function(server_position, my_ping) {
            _x = server_position.x;
            _y = server_position.y;
            _current_direction = server_position.d;
            _y_velocity = server_position.vy;
            _name = server_position.name;
            update((server_position.age + my_ping) / 1000);
        };

        var jump = function() {
            if (onSolidGround()) {
                _y_velocity = jump_settings.jump_speed;
            }
        };

        var serialize = function() {
            return {
                x: _x,
                y: _y,
                d: _current_direction,
                vy: _y_velocity,
                name: _name
            };
        };

        return {
            x: function() {
                return _x;
            },
            y: function() {
                return _y;
            },
            name: function() {
                return _name;
            },
            update: update,
            jump: jump,
            rationalise: rationalise,
            serialize: serialize
        };
    };
});
