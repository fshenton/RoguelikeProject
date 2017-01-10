"use strict";

var Roguelike = Roguelike || {};

Roguelike.Game = function(){};

Roguelike.Game.prototype = {
	create: function(){
		//set up map
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