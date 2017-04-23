'use strict';

//use namespace
var Roguelike = Roguelike || {};

Roguelike.Preload = function(){
	this.background = null;
	this.preloadBar = null;
};

Roguelike.Preload.prototype = {
	preload: function(){
		//show loading screen (often very brief)
		this.background = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBackground');
		this.preloadBar = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);
		
		//LOAD ASSETS

		//images for world objects and map tiles
		this.load.image('floorTile', 'assets/images/floorTile64.png', 64, 64);	
		this.load.image('wallTile', 'assets/images/newWall.png', 64, 64);	
		this.load.image('exitTile', 'assets/images/exit.png', 64, 64);
		this.load.image('safeTile', 'assets/images/safe.png', 64, 64);
		this.load.image('terminal1', 'assets/images/terminal1.png', 64, 64);
		this.load.image('terminal2', 'assets/images/terminal2.png', 64, 64);


		//spritesheets for actors and animations
		this.load.spritesheet('player', 'assets/images/Character1Walk.png', 64, 64);
		this.load.spritesheet('playerDeath', 'assets/images/Character1Hurt.png', 64, 64);	
		this.load.spritesheet('armor1', 'assets/images/Armor1Walk.png', 64, 64);	
		this.load.spritesheet('armor1Death', 'assets/images/Armor1Hurt.png', 64, 64);
		this.load.spritesheet('armor2', 'assets/images/Armor2Walk.png', 64, 64);	
		this.load.spritesheet('armor2Death', 'assets/images/Armor2Hurt.png', 64, 64);
		this.load.spritesheet('agent', 'assets/images/AgentWalk.png', 64, 64);		
		this.load.spritesheet('agentDeath', 'assets/images/AgentDeath.png', 64, 64);	

		//music
		this.load.audio('eCommerce', 'assets/audio/BoxCat_Games_-_09_-_eCommerce.mp3');

		//sfx
		this.load.audio('terminalHum', 'assets/audio/bmusic92__computer-hum.mp3');
		this.load.audio('mouseClick', 'assets/audio/sillyslimeball__mouse-click.mp3');
		this.load.audio('gameOver', 'assets/audio/landlucky__game-over-sfx-and-voice.mp3');
		this.load.audio('playerHurt', 'assets/audio/alex-audio__hurt.mp3');
		this.load.audio('miss', 'assets/audio/petenice__whoosh.wav');
		this.load.audio('heartbeat', 'assets/audio/urupin__heartbeat.mp3')
		this.load.audio('openContainer', 'assets/audio/lukeupf__container.wav');
		this.load.audio('APup', 'assets/audio/skowm001__1-tone-chime.wav');
		this.load.audio('zap', 'assets/audio/2joelaudio__electric-zap-001.wav');
	},
	create: function(){
		this.game.state.start('MainMenu');
	}
}