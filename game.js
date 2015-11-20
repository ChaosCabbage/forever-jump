
requirejs(['parabola', 'draw', 'floorgeneration'],
function (makeParabola, graphics, floorGen) {
	
	var stage_limits = {
		left: 20,
		right: graphics.size.width() - 20
	};
	
	var floors = 
		[	{ left:0, right:graphics.size.width(), y:30 }	];
		
	var latest_parabola;
	
	var current_direction = 1;
		
	function createJumpParabola(start_position) {
		return makeParabola(start_position, {x: 8 * current_direction, y:12}, 1);
	}

	function draw() {
		graphics.wipe("AntiqueWhite");
		graphics.drawWalls();
		
		if (latest_parabola) {
			graphics.drawParabola(latest_parabola);
		}
		
		floors.forEach(graphics.drawFloor);
	}
	
	function generateNewFloor(previous_floor) {
		var allowed_widths = {lower: 20, upper: 100};
		var new_floor = floorGen(
			previous_floor, 
			createJumpParabola({ x: 0, y: 0 }), 
			current_direction, 
			stage_limits, 
			allowed_widths
		);
		
		return {
			floor: new_floor.floor,
			parabola: createJumpParabola(new_floor.jump_position)
		};		
	}	

	function start() {
		var generate_button = document.getElementById("generate");
		generate_button.addEventListener("click", function() {
			
			var floor = generateNewFloor(floors[floors.length-1]);
			latest_parabola = floor.parabola;
			floors.push(floor.floor);
			
			if ((floor.floor.right == stage_limits.right) || (floor.floor.left == stage_limits.left)) {
				current_direction *= -1;
			}			

			draw();	
			
		});
			

		draw();		
	}

	start();
});