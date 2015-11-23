define(function() {

	var the_game_canvas = document.getElementById("game");
	var the_canvas_context = the_game_canvas.getContext("2d");

	the_game_canvas.setAttribute("width", the_game_canvas.offsetWidth);
	the_game_canvas.setAttribute("height", the_game_canvas.offsetHeight);

	function w() { return the_game_canvas.width; }		
	function h() { return the_game_canvas.height; }	
	
	function yFromGameY(game_y) {
		return h() - game_y;
	}

	function wipe(colour) {
		the_canvas_context.fillStyle = colour;
		the_canvas_context.fillRect(0,0,w(),h());
	}

	function drawWalls() {
		the_canvas_context.fillStyle = "black";
		the_canvas_context.fillRect(0,0,20,h());
		the_canvas_context.fillRect(w()-20,0,w(),h());
	}
	
	function drawBloke(bloke) {
		var y = yFromGameY(bloke.y());
		the_canvas_context.fillStyle = "black";
		the_canvas_context.fillRect(bloke.x() - 5, y - 20, 10, 20);
	}

	function drawParabola(parabola) {
		var steps = 30;
		var max_t = parabola.apexParameter() * 2;
		var t_step = max_t / steps;
		
		the_canvas_context.fillStyle = "red";
		
		for (var step = 0; step <= steps; ++step) {
			var p = parabola.evaluate(step * t_step);
			the_canvas_context.beginPath();
			the_canvas_context.arc(p.x,yFromGameY(p.y),2,0,2*Math.PI);
			the_canvas_context.fill();
		}
	}

	function drawFloor(floor) {
		// left, right, y
		var floorThickness = 10;
		
		var y = yFromGameY(floor.y);
		
		the_canvas_context.fillStyle = "black";
		the_canvas_context.fillRect(floor.left,y,floor.right-floor.left,floorThickness);
	}

	return {
		size: {width: w, height: h },
		wipe: wipe,
		drawWalls: drawWalls,
		drawParabola: drawParabola,
		drawFloor: drawFloor,
		drawBloke: drawBloke
	};
});