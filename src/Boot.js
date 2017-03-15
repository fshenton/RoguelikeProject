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

		//this.scale.minHeight = window.innerHeight*window.devicePixelRatio;
		//this.scale.maxHeight = window.innerHeight*window.devicePixelRatio;
		//this.scale.minWidth = window.innerWidth*window.devicePixelRatio;
		//this.scale.maxWidth = window.innerWidth*window.devicePixelRatio;

		//window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio

		if(window.screen.width > 1900 && window.screen.height > 1000){
			this.scale.minWidth = 1600;
			this.scale.minHeight = 900;
			this.scale.maxWidth = 1600;
			this.scale.maxHeight = 900;
		}
		else{
			this.scale.minWidth = 1280;
			this.scale.minHeight = 720;
			this.scale.maxWidth = 1280;
			this.scale.maxHeight = 720;
		}

		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		//screensize will be set automatically
		this.scale.updateLayout(true);

		//physics system for movement
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		//start preloader
		this.game.state.start('Preload');
	}
}