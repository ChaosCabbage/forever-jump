define(function() {
	return function makeParabola(start_point, pixel_velocity_vector, pixel_gravity) {
		var y0 = start_point.y;
		var x0 = start_point.x;
		var vy0 = pixel_velocity_vector.y;
		var vx0 = pixel_velocity_vector.x;
		
		var y = function(t) {
			return y0 + (vy0 * t) - (0.5 * pixel_gravity * t * t); 
		};
		var x = function(t) {
			return x0 + vx0 * t;
		};
		
		var t_apex = vy0 / pixel_gravity;
		
		var solveForY = function(y) {
			// We all know the quadratic formula, don't we?
			var determinent = (vy0 * vy0) + 2*pixel_gravity*(y0 - y);
			if (determinent < 0) { return null;	} // unicorns and pixies!
			return (-vy0 + Math.sqrt(determinent)) / (-pixel_gravity);		
		}
		
		return {
			evaluate: function(t) { return {x: x(t), y: y(t)}; },
			apexParameter: function() { return t_apex; },
			solveForY: solveForY
		};		
	
	};
});