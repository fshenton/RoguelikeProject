"use strict";

var Roguelike = Roguelike || {};

Roguelike.Preload = function(){
	this.background = null;
	this.preloadBar = null;
};

Roguelike.Preload.prototype = {
	preload: function(){
		//show loading screen
		//this.background = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBackground');
		//this.preloadBar = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBar');
		//this.load.setPreloadSprite(this.preloadBar);
		
		//load game assets	
	},
	create: function(){
		this.game.state.start('MainMenu');
	}
}