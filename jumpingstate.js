define(["./parabola","./floorgeneration", "./settings"], 
function(makeParabola, floorGen, settings) {
	
	function createJumpParabola(start_position, direction) {
		return makeParabola(start_position, 
		                    {x: settings.x_speed * direction, y: settings.jump_speed}, 
							settings.gravity);
	}
	
	function makeFloorGenerator(floors, stage_limits) {
	
		function generateNewFloor(previous_floor, direction) {
			var allowed_widths = {lower: 40, upper: 110};
			var new_floor = floorGen(
				previous_floor, 
				createJumpParabola({ x: 0, y: 0 }, direction), 
				direction, 
				stage_limits, 
				allowed_widths
			);
			
			return new_floor.floor;
		};
		
		var floor_generation_direction = 1;
		
		function generateFloorsUpTo(final_y) {
			
			var latest_floor = floors[floors.length-1];
			if (latest_floor.y > final_y) { return; }		
			
			var floor = generateNewFloor(latest_floor, floor_generation_direction);
			floors.push(floor);
				
			if ((floor.right == stage_limits.right) || (floor.left == stage_limits.left)) {
				floor_generation_direction *= -1;
			}		
			
			generateFloorsUpTo(final_y);
		};
		
		return {
			generateFloorsUpTo: generateFloorsUpTo
		};
	};
	
	return function createState(
		bloke, 
		death, 
		the_floors, 
		stage_limits, 
		switchToDeathState, 
		maxVisibleY
	) {		
	
		var floor_generator = makeFloorGenerator(the_floors, stage_limits);
		var death_speed = 10; // pixels per second
		
		function update(seconds_elapsed) {
			bloke.update(seconds_elapsed);
			death.y += death_speed * seconds_elapsed;
			
			if (death.y > bloke.y()) {
				switchToDeathState();
			}
			
			floor_generator.generateFloorsUpTo(maxVisibleY());
		}	
		
		function preventEvent(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		};	
		
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
	}
	
});