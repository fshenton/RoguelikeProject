"use strict";

var Roguelike = Roguelike || {};

Roguelike.MainMenu = function(){};

Roguelike.MainMenu.prototype = {
	init: function(){}, //for score + highscore?
	create: function(){}, //set up the menu options
	update: function(){} //listen for elements to be clicked by user, change display/change state based on what they click
}