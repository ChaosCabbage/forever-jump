define(["./random"], function(random) {
	
	var generator = random(123);	
	
	function generateBetween(lower, upper) {
		var t = generator();
		return t * lower + (1-t) * upper;
	}
	
	function lowerFraction() {
		return (5/8);
	}
	function upperFraction() {
		return (7/8);
	}
	
	function maxJumpWidth(jump_parabola) {
		var max_param = jump_parabola.apexParameter() * 2;
		var upper_limit = max_param * upperFraction();
		
		var origin = jump_parabola.evaluate(0);
		var last_point = jump_parabola.evaluate(upper_limit);
		
		return Math.abs(last_point.x - origin.x);
	}
	
	function minJumpWidth(jump_parabola) {
		var max_param = jump_parabola.apexParameter() * 2;
		var lower_limit = max_param * lowerFraction();
		
		var origin = jump_parabola.evaluate(0);
		var first_point = jump_parabola.evaluate(lower_limit);
		return Math.abs(first_point.x - origin.x);
	}
	
	var EDGE_LEEWAY = 12; // probably needs to be more clever
	
	function safeStartLimits(previous_floor, max_jump_width, stage_limits, min_width, direction) {
		
		var max_x = previous_floor.right - EDGE_LEEWAY;
		var min_x = previous_floor.left + EDGE_LEEWAY;
		
		if (direction > 0) {
			max_x = Math.min(max_x, stage_limits.right - max_jump_width - min_width);
			min_x = Math.max(min_x, stage_limits.left);
		} else {
			max_x = Math.min(max_x, stage_limits.right);
			min_x = Math.max(min_x, stage_limits.left + max_jump_width + min_width);
		}		
		
		return {
			left: min_x,
			right: max_x
		};	
		
	}
	
	return function generateNewFloor(previous_floor, jump_parabola, direction, stage_limits, width_limits) {
		
		var limits = safeStartLimits(previous_floor, maxJumpWidth(jump_parabola), stage_limits, width_limits.lower, direction);
		var jump_x = generateBetween(limits.left, limits.right);		
		
		// Want to place the new floor somewhere in the range of the parabola,
		// between about 1/4 and 3/4 of the second half.
		
		var max_param = jump_parabola.apexParameter() * 2;
		var lower_limit = max_param * lowerFraction();
		var upper_limit = max_param * upperFraction();
		
		var landingPoint = jump_parabola.evaluate(generateBetween(lower_limit, upper_limit));
		var origin = jump_parabola.evaluate(0);
		
		var new_point = {
			x: landingPoint.x - origin.x + jump_x,
			y: landingPoint.y - origin.y + previous_floor.y
		};
		
		var new_width = generateBetween(width_limits.lower, width_limits.upper);
		
		if (direction > 0)  {
			new_floor = {
				left: new_point.x,
				right: new_point.x + new_width,
				y: new_point.y
			};			
		} else {
			new_floor = {
				left: new_point.x - new_width,
				right: new_point.x,
				y: new_point.y
			};	
		}
		
		new_floor.right = Math.min(new_floor.right, stage_limits.right);
		new_floor.left = Math.max(new_floor.left, stage_limits.left);
		
		// Safety check - is there enough room for another platform?
		var minimum_jump = minJumpWidth(jump_parabola);
		if (direction > 0) {
			if (new_floor.right > stage_limits.right - width_limits.lower - minimum_jump) {
				new_floor.right = stage_limits.right;
			}
		} else {
			if (new_floor.left < stage_limits.left + width_limits.lower + minimum_jump) {
				new_floor.left = stage_limits.left;
			}
		}
		
		return {
			floor: new_floor,
			jump_position: { x: jump_x, y: previous_floor.y }
		};		
	};
});