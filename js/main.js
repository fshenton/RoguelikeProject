"use strict";

//namespace
var Roguelike = Roguelike || {};

//create game
Roguelike.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');

//add states
Roguelike.game.state.add('Boot', Roguelike.Boot);
Roguelike.game.state.add('Preload', Roguelike.Preload);
Roguelike.game.state.add('MainMenu', Roguelike.MainMenu);
Roguelike.game.state.add('Game', Roguelike.Game);
Roguelike.game.state.add('GameOver', Roguelike.GameOver);

//start Boot state
Roguelike.game.state.start('Boot');