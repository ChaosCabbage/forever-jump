
requirejs(['draw', 'jumpingstate', 'deathstate', 'bloke', 'settings'],
function (graphics, makeJumpState, makeDeathState, makeBloke, settings) {
	
	var first_floor_y = 40;
	var death_start_y = -30;
	
	var stage_limits = {
		left: 20,
		right: graphics.size.width() - 20
	};

	var max_score = 0;
	
	
	var the_floors = 
		[	{ left:0, right:graphics.size.width(), y: first_floor_y }	];
	
	var bloke = makeBloke(first_floor_y, settings, the_floors, stage_limits);
	
	var death = {
		y: death_start_y
	};

	function viewport_y() {
		return Math.max(0, bloke.y() - 200);
	}

	function currentScore() {
		return bloke.y() - first_floor_y;
	}
	
	function draw() {	
		var view = viewport_y();		
		graphics.wipe("AntiqueWhite");
		graphics.drawWalls();
		graphics.drawBloke(bloke, view);		
		the_floors.forEach(function(floor){ graphics.drawFloor(floor, view); });
		graphics.drawDeathLine(death.y, view);
		graphics.drawMaxScore(max_score);
		graphics.drawHeight(currentScore());
	}
	
	var state = null;
	
	function switchState(new_state) {
		if (state) { state.unload(); }
		state = new_state;
		state.start();		
	}
	
	function createDeathState() {
		var switchToJumpingState = function() { switchState(createJumpingState()); };
		return makeDeathState(death_start_y, the_floors, death, bloke, switchToJumpingState);
	}
	
	function createJumpingState() {
		var maxVisibleY = function() { 
			return graphics.size.height() + viewport_y(); 
		};
		var switchToDeathState = function() { 
			switchState(createDeathState()); 
		};
		return makeJumpState(bloke, death, the_floors, stage_limits, switchToDeathState, maxVisibleY);
	}
	
	function init() {
		switchState(createJumpingState());
	}
	
	function start() {
		init();		
		
		var previous_time = null;
		function step(timestamp) {
			if (!previous_time) { previous_time = timestamp; }
			var seconds_elapsed = (timestamp - previous_time) / 1000;
			
			state.update(seconds_elapsed);
			max_score = Math.max(max_score, currentScore())
			draw();
			
			previous_time = timestamp;
			window.requestAnimationFrame(step);
		};
		window.requestAnimationFrame(step);
		
		
	}

	start();
});