
requirejs(['draw', 'jumpingstate', 'deathstate', 'bloke', 'settings', 'broadcaster', 'rationalise'],
function (graphics, makeJumpState, makeDeathState, makeBloke, settings, makeBroadcaster, startServerRationaliser) {

	var socket = io();
	
	var stage_limits = {
		left: 20,
		right: graphics.size.width() - 20
	};

	var max_score = 0;
	
	var the_floors = 
		[	{ left:0, right:graphics.size.width(), y: settings.first_floor_y }	];

	var makeBlokeWithCurrentSettings = function() {
		return makeBloke(settings, the_floors, stage_limits);
	}
	
	var bloke = makeBlokeWithCurrentSettings();

	var broadcaster = makeBroadcaster(bloke, socket);
	
	var death = {
		y: settings.death_start_y
	};

	var otherBuggers = {};
	startServerRationaliser(otherBuggers, socket, makeBlokeWithCurrentSettings);
	function forEachOtherBugger(fn) {
		for (var key of Object.keys(otherBuggers)) {
			fn(otherBuggers[key])
		}
	}

	function viewport_y() {
		return Math.max(0, bloke.y() - 200);
	}

	function currentScore() {
		return bloke.y() - settings.first_floor_y;
	}
	
	function draw() {	
		var view = viewport_y();		
		graphics.wipe("AntiqueWhite");
		graphics.drawWalls();
		graphics.drawBloke(bloke, view);
		forEachOtherBugger(function(other) {
			graphics.drawBloke(other, view, "gray");
		})
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
		return makeDeathState(settings, the_floors, death, bloke, switchToJumpingState);
	}
	
	function createJumpingState() {
		var maxVisibleY = function() { 
			return graphics.size.height() + viewport_y(); 
		};
		var switchToDeathState = function() { 
			switchState(createDeathState()); 
		};
		return makeJumpState(settings, bloke, death, the_floors, stage_limits, switchToDeathState, maxVisibleY);
	}
	
	function init() {
		switchState(createJumpingState());
	}

	function update(seconds_elapsed) {
		state.update(seconds_elapsed);
		forEachOtherBugger(function(other) {
			other.update(seconds_elapsed)
		})
		broadcaster.update(seconds_elapsed);
		max_score = Math.max(max_score, currentScore());
		draw();
	}
	
	function start() {
		init();
		
		var previous_time = null;
		function step(timestamp) {
			if (!previous_time) { previous_time = timestamp; }
			var seconds_elapsed = (timestamp - previous_time) / 1000;
			
			update(seconds_elapsed);
			
			previous_time = timestamp;
			window.requestAnimationFrame(step);
		};
		window.requestAnimationFrame(step);
	}

	start();
});