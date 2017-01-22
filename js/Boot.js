'use strict';

//namespace
var Roguelike = Roguelike || {};

Roguelike.Boot = function(){};

Roguelike.Boot.prototype = {
	preload: function() {
		//load images needed for loading screen
		this.load.image('preloaderBackground', 'assets/images/progress_bar_background.png');
		this.load.image('preloaderBar', 'assets/images/progress_bar.png');
	},
	create: function() {
		//loading screen will have a black background
		this.game.stage.backgroundColor = '#000';
		
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.minWidth = 800;
		this.scale.minHeight = 800;
		this.scale.maxWidth = 800;
		this.scale.maxHeight = 800;

		this.scale.pageAlignHorizontally = true;

		//screensize will be set automatically
		//this.scale.updateLayout(true);

		//physics system for movement
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		//start preloader
		this.game.state.start('Preload');
	}
}