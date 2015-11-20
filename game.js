
requirejs(['parabola', 'draw', 'random'],
function (makeParabola, graphics, random) {
	
	var generator = random(123);	
	function generateBetween(lower, upper) {
		var t = generator();
		return t * lower + (1-t) * upper;
	}
	
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
		var parabola = createJumpParabola({
			x: generateBetween(previous_floor.left, previous_floor.right),
			y: previous_floor.y
		});
		
		// Want to place the new floor somewhere in the range of the parabola,
		// between about 1/4 and 3/4 of the second half.
		
		var max_param = parabola.apexParameter() * 2;
		var lower_limit = max_param * (5/8);
		var upper_limit = max_param * (7/8);
		
		var new_point = parabola.evaluate(generateBetween(lower_limit,upper_limit));
		var new_width = generateBetween(20, 200);
		
		if (current_direction > 0)  {
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
		
		return {
			floor: new_floor,
			parabola: parabola
		};		
	}	

	function start() {
		var generate_button = document.getElementById("generate");
		generate_button.addEventListener("click", function() {
			
			var floor = generateNewFloor(floors[floors.length-1]);
			latest_parabola = floor.parabola;
			floors.push(floor.floor);
			
			current_direction *= -1;

			draw();	
			
		});
			

		draw();		
	}

	start();
});