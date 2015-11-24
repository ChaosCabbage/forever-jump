define(function() {
	return function makeBloke(jump_settings, floors, stage_limits) {
		var current_direction = 1;
		
		var x = (stage_limits.right + stage_limits.left) / 2;
		var y = 30;
		
		var man_height = 10;
		
		var y_velocity = 0;
		
		var touchingWall = function() {
			return (x <= stage_limits.left || x >= stage_limits.right);
		}
		
		var touchingFloor = function(floor) {
			if (x < floor.left || x > floor.right) {
				return false;
			}
			return (floor.y >= y && floor.y <= y + man_height);
		}
		
		var onSolidGround = function() {
			if (y_velocity > 0) { 
				return false; // Pass through floors while moving upwards
			}
			
			return floors.some(touchingFloor);
		}
		
		var update = function(seconds_elapsed) {
			x += seconds_elapsed * jump_settings.x_speed * current_direction;
			if (touchingWall()) {
				current_direction *= -1;
			}
			
			y_velocity -= seconds_elapsed * jump_settings.gravity;
			
			if (onSolidGround()) {
				y_velocity = 0;
			}
			
			y += seconds_elapsed * y_velocity;			
		};
		
		var jump = function() {
			if (onSolidGround()) {
			  y_velocity = jump_settings.jump_speed;
			}
		}
		
		return {
			x: function() { return x; },
			y: function() { return y; },
			update: update,
			jump: jump
		};	
	};
});
