define(function() {

	return function createDeathState(start_height, the_floors, death, bloke, switchToJumpingState) {		
	
		var death_speed;
		
		function start() { 
			death_speed = 10;
			the_floors.length = 1; 
		};
		
		function update(seconds_elapsed) {
			bloke.update(seconds_elapsed * 0.05);
			death.y -= death_speed * seconds_elapsed;
			death_speed += 10 * seconds_elapsed;
			
			if (death.y < 0) {
				death.y = start_height;
				switchToJumpingState();
			}
		};
		
		function unload() {
			
		};
		
  		return {
			start: start,
			update: update,
			unload: unload,
		};
	};
});