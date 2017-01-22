'use strict';

var Roguelike = Roguelike || {};

Roguelike.MainMenu = function(){};

var newGameButton, settingsButton, creditsButton, playButton, nameInput;
var menuMusic;

Roguelike.MainMenu.prototype = {
	//var background;
	//var button;

	init: function(){
		//for score + highscore?
	}, 
	create: function(){
		//background
		this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'eye');

		var text = "UNNAMED ROGUELIKE";
		var style = {font: "60px Arial", fill: "#fff", align: "center"};
		var t = this.game.add.text(this.game.width/2, this.game.height/2-200, text, style);
		t.anchor.set(0.5);


		localStorage.setItem("playerName", "Kiriyama");
		this.game.state.start('Game'); //FOR QUICKER DEBUGGING

		// //set up the menu buttons
		// //new game
		// newGameButton = this.game.add.button(this.game.world.centerX-95, this.game.world.centerY-100, 'greybutton', actionOnClick, this);
		// // newGameButton = this.game.add.button(this.game.width/2, this.game.height/2, 'greybutton', actionOnClick, this);

		// newGameButton.onInputOver.add(over, this);
		// newGameButton.onInputOut.add(out, this);
		// newGameButton.onInputUp.add(up, this);

		// //settings
		// settingsButton = this.game.add.button(this.game.world.centerX-95, this.game.world.centerY-40, 'greybutton', actionOnClick, this, 2, 1, 0);

		// settingsButton.onInputOver.add(over, this);
		// settingsButton.onInputOut.add(out, this);
		// settingsButton.onInputUp.add(up, this);

		// //credits
		// creditsButton = this.game.add.button(this.game.world.centerX-95, this.game.world.centerY+20, 'greybutton', actionOnClick, this, 2, 1, 0);

		// creditsButton.onInputOver.add(over, this);
		// creditsButton.onInputOut.add(out, this);
		// creditsButton.onInputUp.add(up, this);

		//play music
		// menuMusic = this.game.add.audio('menuMusic');
		// menuMusic.play();
	}, 
	// 	console.log('button over');
	// over: function(){
	// },
	// out: function(){
	// 	console.log('button out');
	// },
	// up: function(){
	// 	console.log('button up', arguments);
	// },
	// actionOnClick: function(){
	// 	console.log('button clicked');
	// },
	update: function(){
		//listen for elements to be clicked by user, change display/change state based on what they click
		//if(newGame selected) this.game.state.start('Game');
	} 
}

function up(button) {
    console.log('button up');
}

function over(button) {
	button.loadTexture('greybuttonpressed');
    console.log('button over');
}

function out(button) {
	//if(button.texture !== 'greybutton') button.setTexture('greybutton');
    button.loadTexture('greybutton');
    console.log('button out');
}

function actionOnClick(button) {
	//play sound
	//take action
    switch(button){
    	case newGameButton:
    		console.log('start new game!');

    		//debug
    		//enter and save name
    		newGameButton.visible = false;
    		//settingsButton.visible = false;
    		//creditsButton.visible = false;
    		var playerName = prompt("What are you known as?", "Cloud");
    		localStorage.setItem("playerName", playerName);

    		//debug
    		// menuMusic.stop();
    		this.game.state.start('Game');
    		break;
    	case settingsButton:
    		break;
		case creditsButton:
    		break;
    	default:
    		break;
    }
}
    
