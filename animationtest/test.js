define(["../images/bloke/animation"], function(bloke_animation) {

	var the_game_canvas = document.getElementById("game");
	var the_canvas_context = the_game_canvas.getContext("2d");

	the_game_canvas.setAttribute("width", the_game_canvas.offsetWidth);
	the_game_canvas.setAttribute("height", the_game_canvas.offsetHeight);

	function w() { return the_game_canvas.width; }		
	function h() { return the_game_canvas.height; }	
	
	
	function wipe(colour) {
		the_canvas_context.fillStyle = colour;
		the_canvas_context.fillRect(0,0,w(),h());
	}
	
	
	function createAnimation(settings, path) {
		
		var animation = {
			draw: null,
			update: null,
			onload: null
		};	
		
		var the_picture = new Image;
		the_picture.onload = function() { animation.onload() };
		the_picture.src = path + "/" + settings.image;
		
		var time_elapsed = 0;
		var current_frame = 0;
		
		animation.update = function(seconds_elapsed) {
			time_elapsed += seconds_elapsed;
			var frames_to_advance = Math.floor(settings.frames_per_second * time_elapsed);
			time_elapsed -= frames_to_advance / settings.frames_per_second;
			
			current_frame = (current_frame + frames_to_advance) % settings.frames;			
		};
		
		animation.draw = function(position){
			var actual_x = position.x - settings.anchor_point.x;
			var actual_y = position.y - settings.anchor_point.y;
			
			var clip_x = 1 + (settings.frame_width + settings.separation)*current_frame;
			var clip_y = 0;
			var clip_width = settings.frame_width - 1;
			var clip_height = settings.frame_height;
			
			the_canvas_context.drawImage(the_picture,
			                             clip_x, clip_y,
										 clip_width, clip_height,
										 actual_x, actual_y,
										 clip_width, clip_height);
		};
		
		return animation;				
	};
	
	
	
	
	var loaded = false;
	var animation = createAnimation(bloke_animation, "images/bloke");
	animation.onload = function() {
		loaded = true;
	};
	
	function draw(seconds_elapsed) {
		wipe("lightblue");
		if (loaded) {
			animation.update(seconds_elapsed);
			animation.draw({ x: 100, y: 100});
		}
	};
	
	var previous_time = null;
	function step(timestamp) {
		if (!previous_time) { previous_time = timestamp; }
		var seconds_elapsed = (timestamp - previous_time) / 1000;
		
		draw(seconds_elapsed);
		
		previous_time = timestamp;
		window.requestAnimationFrame(step);
	};
	window.requestAnimationFrame(step);	
});