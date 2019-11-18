define(function() {

	var the_game_canvas = document.getElementById("game");
	var the_canvas_context = the_game_canvas.getContext("2d");

	the_game_canvas.setAttribute("width", 500);
	the_game_canvas.setAttribute("height", the_game_canvas.offsetHeight);

	function w() { return the_game_canvas.width; }		
	function h() { return the_game_canvas.height; }	
	
	function yFromGameY(game_y, viewport_bottom_y) {
		return h() - game_y + viewport_bottom_y;
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
	
	function drawBloke(bloke, viewport_bottom_y, colour = "black") {
		var y = yFromGameY(bloke.y(), viewport_bottom_y);
		the_canvas_context.fillStyle = colour;
		
		the_canvas_context.beginPath();
		the_canvas_context.moveTo(bloke.x() - 1, y     );
		the_canvas_context.lineTo(bloke.x() - 5, y - 20);
		the_canvas_context.lineTo(bloke.x()    , y - 40);
		the_canvas_context.lineTo(bloke.x() + 5, y - 20);
		the_canvas_context.lineTo(bloke.x() + 1, y     );
		the_canvas_context.fill();
		
		the_canvas_context.beginPath();
		the_canvas_context.arc(bloke.x(), y - 40, 8, 0,2*Math.PI);
		the_canvas_context.fill();
	}

	function drawParabola(parabola, viewport_bottom_y) {
		var steps = 30;
		var max_t = parabola.apexParameter() * 2;
		var t_step = max_t / steps;
		
		the_canvas_context.fillStyle = "red";
		
		for (var step = 0; step <= steps; ++step) {
			var p = parabola.evaluate(step * t_step);
			the_canvas_context.beginPath();
			the_canvas_context.arc(p.x,yFromGameY(p.y, viewport_bottom_y),2,0,2*Math.PI);
			the_canvas_context.fill();
		}
	}

	function drawFloor(floor, viewport_bottom_y) {
		// left, right, y
		var floorThickness = 10;
		
		var y = yFromGameY(floor.y, viewport_bottom_y);
		
		the_canvas_context.fillStyle = "black";
		the_canvas_context.fillRect(floor.left,y,floor.right-floor.left,floorThickness);
	}
	
	function drawHeight(height) {
		the_canvas_context.font = "30px Arial";
		the_canvas_context.fillStyle = "red";
		the_canvas_context.fillText(Math.floor(height).toString(),28,50);
	}

	function drawMaxScore(height) {
		the_canvas_context.font = "38px Arial";
		the_canvas_context.fillStyle = "blue";
		the_canvas_context.fillText(Math.floor(height).toString(),20,30);
	}
	
	function drawDeathLine(height, viewport_bottom_y) {
		var floorThickness = 2;
		
		var y = yFromGameY(height, viewport_bottom_y);
		the_canvas_context.fillStyle = "red";
		the_canvas_context.fillRect(0,y,w(),floorThickness);
	}

	return {
		size: {width: w, height: h },
		wipe: wipe,
		drawWalls: drawWalls,
		drawDeathLine: drawDeathLine,
		drawParabola: drawParabola,
		drawFloor: drawFloor,
		drawBloke: drawBloke,
		drawHeight: drawHeight,
		drawMaxScore: drawMaxScore
	};
});