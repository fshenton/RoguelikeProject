'use strict';

var Roguelike = Roguelike || {};

Roguelike.MainMenu = function(){};

var nameInput;
var menuMusic;

var gameTitle, newGameText;

Roguelike.MainMenu.prototype = {
	create: function(){

		//this.game.state.start("Game");

		var titleStyle = {font: "100px Tesla", fill: "#ffffff", align: "center"};
		gameTitle = this.game.add.text(Math.floor(this.game.width/2), Math.floor(this.game.height/2-100), "Gone Rogue", titleStyle);
		gameTitle.anchor.set(0.5);
		gameTitle.alpha = 0;
		this.game.add.tween(gameTitle).to({alpha: 1}, 500, "Linear", true, -1);

		var newGameStyle = {font: "30px Tesla", fill: "#00ff00", align: "center"};
		newGameText = this.game.add.text(Math.floor(this.game.width/2), Math.floor(this.game.height/2), "New Game", newGameStyle);
		newGameText.anchor.set(0.5);
		newGameText.alpha = 0;
		// let newGameTween = this.game.add.tween(newGameText).to({y: this.game.height/2+50}, 1000, Phaser.Easing.Linear.None);		
		let newGameTween = this.game.add.tween(newGameText).to({alpha: 1}, 1000, Phaser.Easing.Linear.None);		


		setTimeout(function(){
			newGameTween.start();
		}, 1000);

		newGameText.inputEnabled = true;
		newGameText.events.onInputDown.add(startNewGame, this);
		newGameText.events.onInputUp.add(up, this);
		newGameText.events.onInputOut.add(out, this);
		newGameText.events.onInputOver.add(over, this);

		//play music
		//menuMusic = this.game.add.audio('menuMusic');
		//menuMusic.play();
	}, 
}

function up(button) {
    console.log('button up');
}

function over(button) {
	button.fill = "#ff0000";
    console.log('button over');
}

function out(button) {
    button.fill = "#00ff00";
    console.log('button out');
}

function startNewGame(text){

	console.log('start new game!');

	text.destroy();

	var playerName = prompt("What's your name?", "Cloud");

	localStorage.setItem("playerName", playerName);

	// menuMusic.stop();
	this.game.state.start('Game');
}
    
