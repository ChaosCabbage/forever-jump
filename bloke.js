define(function() {
	
	function collidesWithFloor(floor, previous_pos, new_pos) {
		// Perform a straight line collision test.
		// Maybe I'll work my lovely parabolas in here eventually :(
		
		var t = (floor.y - previous_pos.y) / (new_pos.y - previous_pos.y);
		if (t < 0 || t > 1) { return false;}
		var x = t * new_pos.x + (1-t)*previous_pos.x;
		
		return (x >= floor.left && x <= floor.right);
	};
	
	// Return the floor collided with, or null.
	function collideFloors(floors, previous_pos, new_pos) {
		for (var i = 0; i < floors.length; ++i) {
			var floor = floors[i] ;
			if (collidesWithFloor(floor, previous_pos, new_pos)) {
				return floor;
			}
		}
		return null;
	};
	
	return function makeBloke(jump_settings, floors, stage_limits) {
		var man_halfwidth = 5;
		
		var _current_direction = 1;		
				
		var _x = (stage_limits.right + stage_limits.left) / 2;
		var _y = 30;
		
		var _y_velocity = 0;
		
		var pos = function() {
			return { x: _x, y: _y };
		};
		
		var touchingWall = function(x) {
			return (x <= stage_limits.left + man_halfwidth || 
			        x >= stage_limits.right - man_halfwidth);
		};
		
		var collideWithWall = function(x) {
			var new_x = Math.max(x, stage_limits.left + man_halfwidth);
			new_x = Math.min(new_x, stage_limits.right - man_halfwidth);
			return new_x;
		}
		
		var jumpCollision = function(new_pos) {
			if (_y_velocity > 0) { 
				return null; // Pass through floors while moving upwards
			}			
			return collideFloors(floors, pos(), new_pos);
		};
		
		var onSolidGround = function() {
			var test_pos = { x: _x, y: _y - 10};
			return (jumpCollision(test_pos) != null);
		};
		
		var update = function(seconds_elapsed) {
			_y_velocity -= seconds_elapsed * jump_settings.gravity;
			
			var new_x = _x + seconds_elapsed * jump_settings.x_speed * _current_direction;			
			var new_y = _y + seconds_elapsed * _y_velocity;			
			
			var collided_floor = jumpCollision({x: new_x, y: new_y});
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
		
		var jump = function() {
			if (onSolidGround()) {
			  _y_velocity = jump_settings.jump_speed;		  
			}
		}
		
		return {
			x: function() { return _x; },
			y: function() { return _y; },
			update: update,
			jump: jump
		};	
	};
});
