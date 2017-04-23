'use strict';

//use namespace
var Roguelike = Roguelike || {};

//create empty object
Roguelike.MainMenu = function(){};

var gameTitle, newGameText;

Roguelike.MainMenu.prototype = {
	create: function(){
		//create two pieces of text and animate them

		var titleStyle = {font: "100px Tesla", fill: "#ffffff", align: "center"};
		gameTitle = this.game.add.text(Math.floor(this.game.width/2), Math.floor(this.game.height/2-100), "Gone Rogue", titleStyle);
		gameTitle.anchor.set(0.5);
		gameTitle.alpha = 0;
		this.game.add.tween(gameTitle).to({alpha: 1}, 500, "Linear", true, -1);

		var newGameStyle = {font: "30px Tesla", fill: "#00ff00", align: "center"};
		newGameText = this.game.add.text(Math.floor(this.game.width/2), Math.floor(this.game.height/2), "New Game", newGameStyle);
		newGameText.anchor.set(0.5);
		newGameText.alpha = 0;
		let newGameTween = this.game.add.tween(newGameText).to({alpha: 1}, 1000, Phaser.Easing.Linear.None);		

		//add delay before animations start
		setTimeout(function(){
			newGameTween.start();
		}, 1000);

		//if player clicks the new game text, move to next step (name char and start game)
		newGameText.inputEnabled = true;
		newGameText.events.onInputDown.add(startNewGame, this);
		newGameText.events.onInputOut.add(out, this);
		newGameText.events.onInputOver.add(over, this);
	}, 
};

function over(button) {
	button.fill = "#ff0000";
}

function out(button) {
    button.fill = "#00ff00";
}
//Ask for player name, then start game.
function startNewGame(text){

	//console.log('start new game!');

	text.destroy();

	//not very elegant but it does the job
	var playerName = prompt("What's your name?", "Cloud");

	//store player name in cache to be shown on in-game HUD
	localStorage.setItem("playerName", playerName);

	this.game.state.start('Game');
}
    
