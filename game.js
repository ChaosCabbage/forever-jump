
requirejs(['draw', 'jumpingstate', 'deathstate', 'bloke', 'settings'],
function (graphics, makeJumpState, makeDeathState, makeBloke, settings) {
	
	var stage_limits = {
		left: 20,
		right: graphics.size.width() - 20
	};
	
	var the_floors = 
		[	{ left:0, right:graphics.size.width(), y:30 }	];
	
	var bloke = makeBloke(settings, the_floors, stage_limits);
	
	var death = {
		y: 0
	};

	function viewport_y() {
		return Math.max(0, bloke.y() - 200);
	}
	
	function draw() {	
		var view = viewport_y();		
		graphics.wipe("AntiqueWhite");
		graphics.drawWalls();
		graphics.drawBloke(bloke, view);		
		the_floors.forEach(function(floor){ graphics.drawFloor(floor, view); });
		graphics.drawDeathLine(death.y, view);
		graphics.drawHeight(bloke.y());
	}
	
	var state = null;
	
	function switchState(new_state) {
		if (state) { state.unload(); }
		state = new_state;
		state.start();		
	}
	
	function createDeathState() {
		var switchToJumpingState = function() { switchState(createJumpingState()); };
		return makeDeathState(the_floors, death, bloke, switchToJumpingState);
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
			draw();
			
			previous_time = timestamp;
			window.requestAnimationFrame(step);
		};
		window.requestAnimationFrame(step);
		
		
	}

	start();
});