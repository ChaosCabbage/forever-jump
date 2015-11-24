
requirejs(['parabola', 'draw', 'floorgeneration', 'bloke'],
function (makeParabola, graphics, floorGen, makeBloke) {
	
	var stage_limits = {
		left: 20,
		right: graphics.size.width() - 20
	};
	
	var floors = 
		[	{ left:0, right:graphics.size.width(), y:30 }	];
		
	var settings = {
		x_speed: 250,
		jump_speed: 700,
		gravity: 2000
	};	
	
	var bloke = makeBloke(settings, floors, stage_limits);
		
	function createJumpParabola(start_position, direction) {
		return makeParabola(start_position, 
		                    {x: settings.x_speed * direction, y: settings.jump_speed}, 
							settings.gravity);
	}

	function viewport_y() {
		return Math.max(0, bloke.y() - 200);
	}
	
	function draw() {	
		var view = viewport_y();		
		graphics.wipe("AntiqueWhite");
		graphics.drawWalls();
		graphics.drawBloke(bloke, view);		
		floors.forEach(function(floor){ graphics.drawFloor(floor, view); });
		graphics.drawHeight(bloke.y());
	}
	
	function makeFloorGenerator() {
	
		function generateNewFloor(previous_floor, direction) {
			var allowed_widths = {lower: 30, upper: 110};
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
		
		function preventEvent(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		};		
		
		window.addEventListener("touchstart", function(evt) {
			bloke.jump();
			return preventEvent(evt);
		}, false);
		window.addEventListener("click", preventEvent, false);
		window.addEventListener("touchend", preventEvent, false);
		window.addEventListener("touchmove", preventEvent, false);
		window.addEventListener("scroll", preventEvent, false);
		
		var previous_time = null;
		function step(timestamp) {
			if (!previous_time) { previous_time = timestamp; }
			var seconds_elapsed = (timestamp - previous_time) / 1000;
			
			bloke.update(seconds_elapsed);
			draw();
			floorGenerator.generateFloorsUpTo(graphics.size.height() + viewport_y());
			
			previous_time = timestamp;
			window.requestAnimationFrame(step);
		};
		window.requestAnimationFrame(step);
		
		
	}

	start();
});