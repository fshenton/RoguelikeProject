'use strict';

var Roguelike = Roguelike || {};

Roguelike.Preload = function(){
	this.background = null;
	this.preloadBar = null;
};

Roguelike.Preload.prototype = {
	preload: function(){
		//show loading screen
		this.background = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBackground');
		this.preloadBar = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);
		
		//load game assets	

		//images
		this.load.image('eye', 'assets/images/maxresdefault800600.jpg');
		this.load.image('beautifulFace', 'assets/images/Blade-Runner-2-Director.jpg');

		//spritesheets
		this.load.spritesheet('character', 'assets/images/Character1Walk.png', 12, 12);
		this.load.spritesheet('agent', 'assets/images/AgentWalk.png', 12, 12);	
		this.load.spritesheet('armor1', 'assets/images/ArmorWalk.png', 12, 12);	
		this.load.spritesheet('armor2', 'assets/images/Armor2Walk.png', 12, 12);	

		//buttons
		this.load.image('greybutton', 'assets/images/grey_button00.png')
		this.load.image('greybuttonpressed', 'assets/images/grey_button01.png')

		//audio
		this.load.audio('menuMusic', 'assets/audio/Rachel.mp3');
		this.load.audio('gameMusic', 'assets/audio/Blush.mp3');
		// this.load.audio('footSteps', 'assets/audio/xxxx');
		// this.load.audio('terminalUse', 'assets/audio/xxxx');
		// this.load.audio('takenDamage', 'assets/audio/xxxx');
		// this.load.audio('enemyDamage', 'assets/audio/xxxx');
	},
	create: function(){
		this.game.state.start('MainMenu');
	}
}