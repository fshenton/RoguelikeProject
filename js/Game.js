'use strict';

var Roguelike = Roguelike || {};

Roguelike.Game = function(){};

const mapWidth = 250;
const mapHeight = 250;

var gameMusic;
var map, player, actorList, UI;

Roguelike.Game.prototype = {
	create: function(){
		console.log("Game started");
		console.log(localStorage.getItem("playerName"));

		var text = localStorage.getItem("playerName");
		var style = {font: "30px Arial", fill: "#fff", align: "center"};
		var t = this.game.add.text(this.game.width/2, 15, text, style);
		t.anchor.set(0.5);

		//play music
		gameMusic = this.game.add.audio('gameMusic');
		gameMusic.play();

		map = [];
		//set up map
		//initMap();
		//initActors();

		//populte with npcs, player and items
		//setup animations/sprites
		//setup physics
		//add sound
		//initialise score and other values
		//draw GUI
	},
	update: function(){
		//player movement & dodging & attacking
		//AI decisions
		//check collisions with enemies, if so call hitEnemy
		//check collisions with items/objects, if so call interact or smth
		//lighting
	},
	gameOver: function(){}
}

function initMap(){
	//for(let x = 0 < mapWidth
	//map[x] = []
	//for(let y = 0 < maxHeight
	//map[x].push("randomTile"); //based on map gen approach
}