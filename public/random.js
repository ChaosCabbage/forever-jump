define(function() {
	return function(seed) {
		return function random() {
			var x = Math.sin(seed++) * 10000;
			return x - Math.floor(x);
		};
	};	
});