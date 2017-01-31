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

		//single sprites
		// this.load.image('floorTile', 'assets/images/floorTile.png', 32, 32);	
		// this.load.image('wallTile', 'assets/images/wallTile.png', 32, 32);		
		// this.load.image('doorTile', 'assets/images/doorTile.png', 32, 32);	
		//64
		this.load.image('floorTile', 'assets/images/floorTile64.png', 64, 64);	
		//this.load.image('wallTile', 'assets/images/wallTile64.png', 64, 64);		
		this.load.image('wallTile', 'assets/images/newWall.png', 64, 64);
		this.load.image('doorTile', 'assets/images/doorTile64.png', 64, 64);	

	
		//this.load.image('player', 'assets/images/Character1.png', 64, 64);

		//spritesheets
		this.load.spritesheet('player', 'assets/images/Character1Walk.png', 64, 64);
		//this.load.spritesheet('player', 'assets/images/Character32.png', 32, 32);
		//this.load.spritesheet('player', 'assets/images/Character32.png', 32, 32);
		this.load.spritesheet('agent', 'assets/images/AgentWalk.png', 64, 64);	
		this.load.spritesheet('armor1', 'assets/images/ArmorWalk.png', 64, 64);	
		this.load.spritesheet('armor2', 'assets/images/Armor2Walk.png', 64, 64);	
		//this.load.spritesheet('interior', 'assets/images/Interior-Furniture.png', 32, 32);	
		this.load.spritesheet('armorDeath', 'assets/images/ArmorDeath.png', 64, 64);	
		this.load.spritesheet('playerDeath', 'assets/images/Character1Hurt.png', 64, 64);	
		

		this.load.image('terminal1', 'assets/images/terminal1.png', 64, 64);
		this.load.image('terminal2', 'assets/images/terminal2.png', 64, 64);

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