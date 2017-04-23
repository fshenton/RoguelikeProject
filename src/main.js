'use strict';

//namespace
var Roguelike = Roguelike || {};

//create game, add to game-div HTML element, auto choose rendering option
Roguelike.game = new Phaser.Game(1366, 768, Phaser.AUTO, 'game-div');

//add states so that Phaser StateManager can switch between them as necessary

Roguelike.game.state.add('Boot', Roguelike.Boot);
//console.log("boot added");

Roguelike.game.state.add('Preload', Roguelike.Preload);
//console.log("preload added");

Roguelike.game.state.add('MainMenu', Roguelike.MainMenu);
//console.log("mainmenu added");

Roguelike.game.state.add('Game', Roguelike.Game);
//console.log("game added");

Roguelike.game.state.add('GameOver', Roguelike.GameOver);
//console.log("gameover added");

//start Boot state
Roguelike.game.state.start('Boot');
//console.log('start boot');