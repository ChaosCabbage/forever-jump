
requirejs(['parabola', 'draw', 'floorgeneration', 'bloke'],
function (makeParabola, graphics, floorGen, makeBloke) {
	
	var stage_limits = {
		left: 20,
		right: graphics.size.width() - 20
	};
	
	var floors = 
		[	{ left:0, right:graphics.size.width(), y:30 }	];
		
	var timestep = 1/30;
	
	var settings = {
		x_speed: 25,
		jump_speed: 50,
		gravity: 15
	};	
	
	var bloke = makeBloke(settings, timestep, floors, stage_limits);
		
	function createJumpParabola(start_position, direction) {
		return makeParabola(start_position, 
		                    {x: settings.x_speed * direction, y: settings.jump_speed}, 
							settings.gravity);
	}

	function draw() {
		graphics.wipe("AntiqueWhite");
		graphics.drawWalls();
		graphics.drawBloke(bloke);		
		floors.forEach(graphics.drawFloor);
	}
	
	function makeFloorGenerator() {
	
		function generateNewFloor(previous_floor, direction) {
			var allowed_widths = {lower: 25, upper: 100};
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
	

	function start() {
		
		var floorGenerator = makeFloorGenerator();
		floorGenerator.generateFloorsUpTo(graphics.size.height());
		
		window.addEventListener("keydown", function(evt) {
			if (evt.keyCode == 32) { 
				bloke.jump();
				evt.preventDefault();
			}			
		}, false);
		
		var game_area = document.getElementById("game");
		game_area.addEventListener("click", bloke.jump, false);
		game_area.addEventListener("touchstart", bloke.jump, false);
		game_area.addEventListener("touchend", function(evt) {
			evt.preventDefault();
		}, false);
		
		setInterval(function() {
			bloke.update();
			draw();
		}, timestep);
	}

	start();
});