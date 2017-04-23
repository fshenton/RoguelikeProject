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

		//changes game size depending on screen size (only 2 options)
		if(window.screen.width > 1900 && window.screen.height > 1000){
			//for desktop
			this.scale.minWidth = 1600;
			this.scale.minHeight = 900;
			this.scale.maxWidth = 1600;
			this.scale.maxHeight = 900;
		}
		else{
			//for laptop
			this.scale.minWidth = 1024;
			this.scale.minHeight = 576;
			this.scale.maxWidth = 1024;
			this.scale.maxHeight = 576;
		}

		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.updateLayout(true);

		//start preloader
		this.game.state.start('Preload');
	}
}