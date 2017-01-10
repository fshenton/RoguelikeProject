"use strict";

//namespace
var Roguelike = Roguelike || {};

Roguelike.Boot = function(){};

Roguelike.Boot.prototype = {
	preload: function() {
		//load images needed for loading screen
		//this.load.image('preloaderBackground', 'assets/images/progress_bar_background.png');
		//this.load.image('preloaderBar', 'assets/images/progress_bar.png');
	},
	create: function() {
		//start preloader
		this.game.state.start('Preload');
	}
}