'use strict';

var Roguelike = Roguelike || {};

Roguelike.Game = function(){};

const mapSize = 50;
const minRoomsize = 3;
const numRooms = 10;
const floorChar = 'R';
const wallChar = 'w';

var gameMusic;

var map;
var floorLayer;
var objLayer;

var rooms;

var player;
var enemy; 
//actorList, UI;

var cursors;

var unnecessaryChecks;

Roguelike.Game.prototype = {
	create: function(){
		console.log("Game started");

		//debug
		//show name
		

		//play music
		// gameMusic = this.game.add.audio('gameMusic');
		// gameMusic.play();

		//set up map array
		initMap();
		expandRandomRooms(); //also populates room adjacency lists
		randomlyConnectAdjacentRooms(); //use room adjency list to add doors connecting the rooms

		//add map to csv
		// var csvMap = '';// = "data:text/csv;charset=utf-8,";

		// map.forEach(function(dataArray, index){
		// 	let dataString = dataArray.join(",");
		// 	csvMap += index < mapSize ? dataString + "\n" : dataString;
		// });

		//this.cache.addTilemap('gMap', null, csvMap, Phaser.Tilemap.CSV);

		//generate tilemap from csv
		//let tMap = this.game.add.tilemap('gMap', 32, 32);
		//console.log(tMap);
		// tMap.addTilesetImage('floorTile');
		// tMap.addTilesetImage('wallTile');
		// tMap.addTilesetImage('doorTile');

		//console.log("tile: ", tMap.getTile(0,0));

		//this.game.world.setBounds(0, 0, tMap.widthInPixels, tMap.heightInPixels);

		//create layers that tiles can be added to
		// floorLayer = tMap.createBlankLayer('floorLayer', mapSize, mapSize, 32, 32);
		// floorLayer.resizeWorld();

		// objLayer = tMap.createBlankLayer('objectLayer', mapSize-100, mapSize-100, 32, 32);

		//displayMap();

		//Add sprites to layers for displaying

		//GROUPS?
		//do I even need tilemap?
		for(let x = 0; x < mapSize; x++){
			for(let y = 0; y < mapSize; y++){
				if(map[x][y] == '.'){
					//floorLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'floorTile'));
					this.game.add.sprite(y*32, x*32, 'floorTile');
					//console.log("floor tile added");
				}
				else if(map[x][y] == '#'){
					//objLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'wallTile'));
					this.game.add.sprite(y*32, x*32, 'wallTile');
					//console.log("wall tile added");
				}
				else if(map[x][y] == 'D'){
					//objLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'doorTile'));
					this.game.add.sprite(y*32, x*32, 'doorTile');
					//console.log("door tile added");
				}
			}
		}

		//console.log("tile: ", tMap.getTile(0,0));
		//console.log(floorLayer);
		//console.log(objLayer);


		//need background
		//this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'beautifulFace');

		let playerName = localStorage.getItem("playerName");
		this.player = new Player(this.game, playerName, 10, 1, 100);

		//this.game.camera.follow(this.player);

		//this.game.physics.arcade.enable(this.player);
		//this.player.body.collideWorldBounds = true;
		//this.game.camera.follow(this.player);


		////HUD STUFF
		var style = {font: "30px Arial", fill: "#fff", align: "center"};
		var t = this.game.add.text(this.game.width/2, 15, playerName, style);
		t.anchor.set(0.5);

		var t = this.game.add.text((this.game.width/2) + 200, 15, this.player.hp, style);
		t.anchor.set(0.5);

		// this.player.sprite = this.game.add.sprite(this.player.x * 32, this.player.y * 32, this.player.sprite, 19);

		//set up mouse button listener + callback
		//on click_up, check if valid move, if so move them/attack
		//ai takes move
		
		//also set up keyboard listener + callbacks

		cursors = this.game.input.keyboard.createCursorKeys();

		////player  & camera
		// var style = {font: '16px monospace', fill: '#fff'};
		// 	playerHUD = this.add.text(0, 0, 'Player life: ' + actorList[0].hp, style);
		// 	playerHUD.fixedToCamera = true;
		// 	playerHUD.cameraOffset.setTo(500, 50);

		////Space hipster
		// this.game.world.setBounds(0, 0, 1920, 1920);
		
		// //same space scrolling background
		// this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
		
		// this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
		// this.player.scale.setTo(2);

		////uses the 4 frames from the spritesheet added, with 5 being the frequency for change
		// this.player.animations.add('fly', [0, 1, 2, 3], 5, true);
		// this.player.animations.play('fly');

		// this.playerScore = 0;

		// //enable player physics for collisions
		// this.game.physics.arcade.enable(this.player);
		// this.playerSpeed = 120;
		// this.player.body.collideWorldBounds = true;

		// this.game.camera.follow(this.player);

		// this.explosionSound = this.game.add.audio('explosion');
		// this.collectSound = this.game.add.audio('collect');
		////Space hipster




		// initActors();
		// initItems();
		// initPhysics();
		// setUpGame()
		// setUpInputHandlers();
		// setUpSoundAndGraphics();
		// setUpHUD();
		// beginRender();

		//console.log(JSON.parse(JSON.stringify(map)));
		console.log(JSON.stringify(map));
		//console.log(csvMap);

		// for(let i = 0; i < rooms.length; i++){
		// 	let r = rooms[i];
		// 	console.log("Room ", r.id, "(x: ", r.tiles[0][0].x, " y: ",  r.tiles[0][0].y, ") has:")
		// 	console.log(r.adjRoomCount, " rooms adjacent to it.");
		// 	console.log(r.roomToLeft, " rooms to its left.");
		// 	console.log(r.roomToTop, " rooms to its top.");
		// 	console.log(r.roomToRight, " rooms to its right.");
		// 	console.log(r.roomToBot, " rooms to its bot.");
		// 	console.log(r.adjacentRooms);
		// 	console.log(r.tiles);
		// }

		//initActors();
	},
	update: function(){
		if (cursors.up.isDown)
	    {
	        moveTo(this.player, 1);
	    }
	    else if (cursors.down.isDown)
	    {
	        moveTo(this.player, 3);
	    }

	    if (cursors.left.isDown)
	    {
	        moveTo(this.player, 0);
	    }
	    else if (cursors.right.isDown)
	    {
	        moveTo(this.player, 2);
	    }
		//player movement & dodging & attacking
		//AI decisions
		//check collisions with enemies, if so call hitEnemy
		//check collisions with items/objects, if so call interact or smth
		//lighting
	},
	gameOver: function(){}
}

var Tile = {
	WALL: '#',
	FLOOR: '.',
	DOOR: 'D',
	PLAYER: 'P'
};

//room object that holds id, coordinates in map, adjacent rooms and expansion information
function Room(num){
	this.id = num,
	this.tiles = [],
	this.x, //initialise?
	this.y,
	this.expLeft = true,
	this.expTop = true,
	this.expRight = true,
	this.expBot = true,
	this.canExp = true,
	this.doors = 0,
	this.adjacentRooms = [];
	this.adjacentRoomCells = [];
	this.adjRoomCount = 0,
	this.roomToLeft = 0,
	this.roomToTop = 0,
	this.roomToRight = 0,
	this.roomToBot = 0;
	//methods?
}

// function Actor(x, y, hp, actorSprite){
// 	console.log(x);
// 	console.log(y);
// 	console.log(hp);
// 	console.log(actorSprite);
// 	this.x = x;
// 	this.y = y;
// 	this.hp = hp;
// 	this.actorSprite = actorSprite;
// 	//want to create sprite in here?
// 	//isPlayer bool
// }

//player and enemy 'inherit' from Actor
function Player(game, name, x, y, hp){
	this.game = game;
	this.name = name;
	this.x = x;
	this.y = y;
	this.hp = hp;
	this.sprite = this.game.add.sprite(x*32, y*32, 'player', 19);
	//Actor.call(this, x, y, hp, 'player');
	//this.name = name;
}

function moveTo(a, d){
// move actors (a) in direction (d) if possible and handle any outcomes resulting from new tile
// function moveTo(a, d){
	//if(validMove(d)){
	
	//SHOULDNT OVEWRITE THE EXISTING TILE, NEED TO ACCOUNT FOR THAT
	switch(d){
		case 0:
			//update map
			//move exactly one tile
			a.sprite.x -=1;
			break;
		case 1:
			//update map
			//move exactly one tile
			a.sprite.y -=1;
			break;
		case 2:
			//update map
			//move exactly one tile
			a.sprite.x +=1;
			break;
		case 3:
			//update map
			//move exactly one tile
			a.sprite.y +=1;
			break;
		default:
			break;
	}
}

// function Enemy(x, y, hp){
// 	Actor.call(x, y, hp, 'enemy');
// }

// Player.prototype = new Actor();

// Enemy.prototype = new Actor();


////spacehipster
/*function drawMap(){
	for(var y = 0; y < ROWS; y++){
		for(var x = 0; x < COLS; x++){
			asciidisplay[y][x] = map[y][x];	
		}
	}
}*/

// function drawActors(){
// 	for(var a in actorList){
// 		if(actorList[a] != null && actorList[a].hp > 0){
// 			asciidisplay[actorList[a].y][actorList[a].x] = a == 0?''+player.hp:'e';
// 		}
// 	}
////spacehipster



////Roguelike-js-master
// function Actor (game, x, y, keySprite) {
// 		this.hp = 3;
// 		this.x = x;
// 		this.y = y;
// 		this.isPlayer = null;
// 		this.damage = 'd8+2';

// 		if (game) {
// 			this.game = game;
// 			this.sprite = game.add.sprite(x * 32, y * 32, keySprite);
// 		} else {
// 			this.game = null;
// 			this.sprite = null;
// 		}
// 	}

// 	function Player (game, x, y) {
// 		Actor.call(this, game, x, y, 'hero');
// 		this.hp = 30;
// 		this.isPlayer = true;
// 		this.damage = 'd6+2';
// 	}

// 	function Enemy (game, x, y) {
// 		Actor.call(this, game, x, y, 'orc');
// 		this.hp = 10;
// 		this.isPlayer = false;
// 		this.damage = 'd4+2';
// 	}

// Actor.prototype.setXY = function (x, y) {
// 		this.x = x;
// 		this.y = y;

// 		// this.sprite.x = x * 32;
// 		// this.sprite.y = y * 32;

// 		this.game.add.tween(this.sprite).to(
// 			{
// 				x: x * 32,
// 				y: y * 32
// 			},
// 			150,
// 			Phaser.Easing.Linear.None,
// 			true
// 		);

// 	};

// 	Player.prototype = new Actor();

// 	Enemy.prototype = new Actor();

// 	function moveTo (actor, dir) {
// 		// check if actor can move in the given direction
// 		if (!Map.canGo(actor, dir)) {
// 			return false;
// 		}

// 		if (dir.x === 1) {
// 			actor.sprite.frame = 2;
// 		} else if (dir.x === -1) {
// 			actor.sprite.frame = 3;
// 		} else if (dir.y === -1) {
// 			actor.sprite.frame = 1;
// 		} else if (dir.y === 1) {
// 			actor.sprite.frame = 0;
// 		}

// 		// moves actor to the new location
// 		var newKey = (actor.x + dir.x) + '_' + (actor.y + dir.y);

// 		// if the destination tile has an actor in it
// 		if (actorMap.hasOwnProperty(newKey) && actorMap[newKey]) {
// 			//decrement hitpoints of the actor at the destination tile
// 			var victim = actorMap[newKey];

// 			// avoid orcs to fight with each other
// 			if (!actor.isPlayer && !victim.isPlayer) {
// 				return;
// 			}

// 			var damage = diceRoll('d8+2').total;
// 			victim.hp -= damage;

// 			var axis = (actor.x === victim.x)
// 				? 'y'
// 				: 'x';

// 			dir = victim[axis] - actor[axis];
// 			dir = dir / Math.abs(dir); // +1 or -1

// 			var pos1 = {}, pos2 = {};

// 			pos1[axis] = (dir * 15).toString();
// 			pos2[axis] = (dir * 15 * (-1)).toString();

// 			game.camera.follow(false);

// 			game.add.tween(actor.sprite)
// 				.to(pos1, 100, Phaser.Easing.Linear.None, true)
// 				.to(pos2, 100, Phaser.Easing.Linear.None, true)
// 				.onComplete.add(function () {
// 					game.camera.follow(actor.sprite);
// 				}, this);

// 			var color = victim.isPlayer ? null : '#fff';

// 			HUD.msg(damage.toString(), victim.sprite, 450, color);

// 			if (victim.isPlayer) {
// 				playerHUD.setText('Player life: ' + victim.hp);
// 			}

// 			// if it's dead remove its reference
// 			if (victim.hp <= 0) {
// 				victim.sprite.kill();
// 				delete actorMap[newKey];
// 				actorList.splice(actorList.indexOf(victim), 1);
// 				if (victim !== player) {
// 					if (actorList.length === 1) {
// 						// victory message
// 						var victory = game.add.text(
// 							game.world.centerX,
// 							game.world.centerY,
// 							'Victory!\nCtrl+r to restart', {
// 								fill: '#2e2',
// 								align: 'center'
// 							}
// 						);
// 						victory.anchor.setTo(0.5, 0.5);
// 					}
// 				}
// 			}
// 		} else {
// 			// remove reference to the actor's old position
// 			delete actorMap[actor.x + '_' + actor.y];

// 			// update position
// 			actor.setXY(actor.x + dir.x, actor.y + dir.y);

// 			// add reference to the actor's new position
// 			actorMap[actor.x + '_' + actor.y] = actor;
// 		}

// 		return true;
// 	}

// function initActors (game) {
// 		// create actors at random locations
// 		actorList = [];
// 		actorMap = {};
// 		var actor, x, y;

// 		var random = function (max) {
// 			return Math.floor(Math.random() * max);
// 		};

// 		var validpos = [];
// 		for (x = 0; x < COLS; x++) {
// 			for (y = 0; y < ROWS; y++) {
// 				if (!Map.tiles[x][y]) {
// 					validpos.push({x: x, y: y});
// 				}
// 			}
// 		}

// 		for (var e = 0; e < ACTORS; e++) {
// 			// create new actor
// 			do {
// 				//var room=m.rooms[random(2)][random(2)];
// 				var r = validpos[random(validpos.length)];
// 				x = r.x;
// 				y = r.y;
// 				// pick a random position that is both a floor and not occupied
// 				//x=room.x+random(room.width);
// 				//y=room.y+random(room.height);
// 			} while (actorMap[x + '_' + y]);

// 			actor = (e === 0)
// 				? new Player(game, x, y)
// 				: new Enemy(game, x, y);


// 			// add references to the actor to the actors list & map
// 			actorMap[actor.x + '_' + actor.y] = actor;
// 			actorList.push(actor);
// 		}

// 		// the player is the first actor in the list
// 		player = actorList[0];
// 		game.camera.follow(player.sprite);

// 	}

// 	function aiAct (actor) {
// 		var directions = [
// 			{x: -1, y: 0},
// 			{x: 1, y: 0},
// 			{x: 0, y: -1},
// 			{x: 0, y: 1}
// 		];

// 		var dx = player.x - actor.x,
// 			dy = player.y - actor.y;

// 		var moveToRandomPos = function () {
// 			var rndDirections = shuffleArray(directions);
// 			for (var i = 0; i < rndDirections.length; i++) {
// 				if (moveTo(actor, rndDirections[i])) {
// 					break;
// 				}
// 			}
// 		};

// 		// if player is far away, walk randomly
// 		if (Math.abs(dx) + Math.abs(dy) > 6) {
// 			moveToRandomPos();
// 		} else {
// 			// otherwise walk towards player
// 			// dumb walk

// 			directions = directions.map(function (e) {
// 				return {
// 					x: e.x,
// 					y: e.y,
// 					dist: Math.pow(dx + e.x, 2) + Math.pow(dy + e.y, 2)
// 				};
// 				//}).sort(function(a,b){ return a.dist-b.dist; });
// 			}).sort(function (a, b) {
// 				return b.dist - a.dist;
// 			});

// 			for (var d = 0, len = directions.length; d < len; d++) {
// 				if (moveTo(actor, directions[d])) {
// 					break;
// 				}
// 			}

// 		}

// 		if (player.hp < 1) {
// 			// game over message
// 			var gameOver = game.add.text(0, 0, 'Game Over\nCtrl+r to restart', {fill: '#e22', align: 'center'});
// 			gameOver.fixedToCamera = true;
// 			gameOver.cameraOffset.setTo(500, 500);
// 		}
// 	}
////Roguelike-js-master





//builds the mapSize x mapSize square array, fills with walls and then plants 3x3 rooms randomly (no overlap)
function initMap(){

	map = [];

	//initialise map (make 2d, then fill with walls)
	for(let x = 0; x < mapSize; x++){
		map[x] = [];
		rooms = [];
		for(let y = 0; y < mapSize; y++){
			map[x][y] = Tile.WALL;
		}
	}

	let minXY = 2;
	let maxXY = mapSize-3;
	let roomsLeftToExpand = numRooms;

	while(roomsLeftToExpand > 0){

		let x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		let y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;

		// let attemptLimit = 100; //might not be needed now we have else
		// let attempt = 0;

		//plant seed & grow to 3x3
		let validRoom = false;
		//find a spot for valid room
		while(!validRoom){
			// if(attempt >= attemptLimit){
			// 	console.log("--------------------------------------------------------");
			// 	console.log("Could not place all rooms in 100 attempts, trying again.");
			// 	console.log("--------------------------------------------------------");
			// 	initMap(); //try again
			// }
		 	console.log("checking for valid room");
		 	if(map[x][y] != Tile.FLOOR){
		 		validRoom = checkValidRoomSize(x, y);
		 		if(!validRoom){
		 			//attempt++;
		 			console.log("Couldn't place with x: ", x, " and y: ", y);
		 			//try new random numbers
		 			x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
					y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		 		} 
		 	}
		 	else{
		 		//attempt++;
		 		console.log("found floor tile while placing new room");
		 		x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
				y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		 	}
		}

		//ADDROOM function
		map[x-1][y-1] = Tile.FLOOR;
		map[x][y-1] = Tile.FLOOR;
		map[x+1][y-1] = Tile.FLOOR;
		map[x-1][y] = Tile.FLOOR;
		map[x][y] = Tile.FLOOR;
		map[x+1][y] = Tile.FLOOR;
		map[x-1][y+1] = Tile.FLOOR;
		map[x][y+1] = Tile.FLOOR;
		map[x+1][y+1] = Tile.FLOOR;

		let currentRoom = numRooms - roomsLeftToExpand; 

		//create new Room object and fill its tile array
		let room  = new Room(currentRoom);
		room.tiles[0] = [{x: x-1, y: y-1}, {x: x, y: y-1}, {x: x+1, y: y-1}];
		room.tiles[1] = [{x: x-1, y: y}, {x: x, y: y}, {x: x+1, y: y}];
		room.tiles[2] = [{x: x-1, y: y+1}, {x : x, y: y+1}, {x: x+1, y: y+1}];

		//add new room to rooms array
		rooms[currentRoom] = room;
		
		//console.log(JSON.stringify(rooms[currentRoom]));
		//console.log(rooms[currentRoom].tiles);

		roomsLeftToExpand--;
		console.log("Room " + currentRoom + " with x:" + x + " y: " + y + " created.");
		
	}

	//console.log(JSON.stringify(map));
}

//checks that new 3x3 rooms can be placed at random coordinates
function checkValidRoomSize(x, y){
	//console.log("in checkvalidroom");

	let space = false;

	//PUT IN NESTED FOR LOOPS
	//basically need a block of 5x5 that is all walls
	//the 3x3 then goes in the center of it

	if(map[x-1][y-1] == Tile.WALL &&
		map[x][y-1] == Tile.WALL &&
		map[x+1][y-1] == Tile.WALL &&
		map[x-1][y] == Tile.WALL &&
		map[x][y] == Tile.WALL &&
		map[x+1][y] == Tile.WALL &&
		map[x-1][y+1] == Tile.WALL &&
		map[x][y+1] == Tile.WALL &&
		map[x+1][y+1] == Tile.WALL){
		
		//check that there are walls all the way around
		if(map[x-2][y-2] == Tile.WALL &&
			map[x-1][y-2] == Tile.WALL &&
			map[x][y-2] == Tile.WALL &&
			map[x+1][y-2] == Tile.WALL &&
			map[x+2][y-2] == Tile.WALL &&

			map[x-2][y+2] == Tile.WALL &&
			map[x-1][y+2] == Tile.WALL &&
			map[x][y+2] == Tile.WALL &&
			map[x+1][y+2] == Tile.WALL &&
			map[x+2][y+2] == Tile.WALL &&

			map[x-2][y-1] == Tile.WALL &&
			map[x-2][y] == Tile.WALL &&
			map[x-2][y+1] == Tile.WALL &&

			map[x+2][y-1] == Tile.WALL &&
			map[x+2][y] == Tile.WALL &&
			map[x+2][y+1] == Tile.WALL){

			space = true;
		}
		else{
			console.log("Cannot have walls around this space. x: " + x + " y: " + y);
		}
	}
	else{
			console.log("Not enough floor space found. x: " + x + " y: " + y);
	}

	return space;
}

//tries to expand all rooms until all directions for each room have been expanded to max
function expandRandomRooms(){

	let roomCannotExpand = 0;

	//console.log("in expand random room method");

	unnecessaryChecks = 0;

	while(roomCannotExpand < numRooms){

		//console.log("rooms left for expanding");

		let rndRoom = Math.floor(Math.random() * rooms.length);

		let rndDir = Math.floor(Math.random() * 4);
		//let rndDir = 3;
		//let rndDir = 3;
		//let rndDir = Math.floor(Math.random() * 2);

		let checkRoom = rooms[rndRoom];

		if(checkRoom.canExp){
			//console.log("Room " , checkRoom.id, " can expand");
			let expResult = expand(checkRoom, rndDir);
			if(!expResult){
				//console.log("Couldn't expand room ", checkRoom.id);
			}
			else{
				//console.log("Expanded room ", checkRoom.id);
			}

			if(!expResult && !checkRoom.expLeft
				&& !checkRoom.expTop
				&&!checkRoom.expRight
				&& !checkRoom.expBot){
				checkRoom.canExp = false;
				roomCannotExpand++;
			}
		}
		else{
			unnecessaryChecks++;
			//console.log("Room ", checkRoom.id, " cannot be expanded further, but still being considered.");
		}
	}

	//console.log("Unnecessary Checks made: ", unnecessaryChecks);

	//return?
}

//takes a direction and a room and expands it if possible
//NEEDS REFACTORING AS ITS A NIGHTMARE TO READ
//ALSO SOME BUGS STILL EXIST WITH ADJACENCY ADDING
function expand(r, d){

	//console.log("in expand method");

	let success;
	let newAdjRoom = false;

	switch(d){
		case 0: //LEFT
			success = false;
			if(r.expLeft){
				let oobCheck = r.tiles[0][0].y-2;
				if(oobCheck >= 0){
					let roomToExpand = true;
					//let i = 0;
					//while(roomToExpand && i < r.tiles[0].length){#

					for(let i = 0; i < r.tiles[0].length; i++){
						let checkX = r.tiles[0][i].x;
						let checkY = r.tiles[0][i].y;

						if(i == 0){
							if(map[checkX-1][checkY-1] != Tile.WALL || map[checkX-1][checkY-2] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to upper left.");
							}
						}
						else if(i == r.tiles[0].length-1){
							if(map[checkX+1][checkY-1] != Tile.WALL || map[checkX+1][checkY-2] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to lower left.");
							}
						}
						if(map[checkX][checkY-1]== Tile.FLOOR || 
							map[checkX][checkY-2] == Tile.FLOOR){
							roomToExpand = false;
							//console.log("Other room found to left.");
							//console.log(adjRoomCellCount);
							if(!newAdjRoom){
								newAdjRoom = true;
								// console.log("----------------------------------------------");
								if(map[checkX][checkY-1]== Tile.FLOOR){
									// console.log("WTF");
								}
								// console.log("Room", r.id, "checking adjacent room to left");
								let adjRoom = findAdjacentCell(0, checkX, checkY-2);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);//({r: adjRoom, addedBy: r.id, dir: 0, fX: checkX, fX: checkY-2});
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX, fY: checkY-2, oX: 0, oY: -2});
									r.roomToLeft++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);//({r: r.id, addedBy: r.id, dir: 0, fX: checkX, fX: checkY-2});
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX, fY: checkY-2, oX: 0, oY: -2});
									rooms[adjRoom].roomToRight++;
									rooms[adjRoom].adjRoomCount++;
								}
								//console.log("New adjacent room found (left)");
							}
							
						}
						else if(map[checkX][checkY-2] == Tile.WALL || i == r.tiles[0].length-1){
							newAdjRoom = false;
							//console.log(r.id + " found wall (left), end of adjacent room");
							//console.log(i == r.tiles[0].length-1 ? true : false);
						}	
						
					}

					if(roomToExpand){
						r.tiles.unshift([]);
						for(let i = 0; i < r.tiles[1].length; i++){
							let newX = r.tiles[1][i].x;
							let newY = r.tiles[1][i].y-1;
							
							r.tiles[0].push({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							success = true;
						}
						//console.log("Room " + r.id + " expanded left.");
					}
					else{
						r.expLeft = false;
					}
				}
				else{
					//console.log("FOUND OUT OF BOUNDS (LEFT) ", oobCheck);
					r.expLeft = false;
				}
			}
			else{
				unnecessaryChecks++;
				//console.log("Shouldn't be checking as flagged that this direction is not expandable.");
			}
			return success;
			break;
		case 1: //TOP
			success = false;
			if(r.expTop){
				let oobCheck = r.tiles[0][0].x-2;
				if(oobCheck >= 0){
					let roomToExpand = true;
					//let i = 0;

					//while(roomToExpand && i < r.tiles.length){
					for(let i = 0; i < r.tiles.length; i++){
						let checkX = r.tiles[i][0].x;
						let checkY = r.tiles[i][0].y;

						if(i == 0){
							if(map[checkX-1][checkY-1] != Tile.WALL || map[checkX-2][checkY-1] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to upper left.");
							}
						}
						else if(i == r.tiles.length-1){
							if(map[checkX-1][checkY+1] != Tile.WALL || map[checkX-2][checkY+1] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to upper right.");
							}
						}
						
						if(map[checkX-1][checkY] == Tile.FLOOR || 
							map[checkX-2][checkY] == Tile.FLOOR){
							roomToExpand = false;
							//console.log("Other room found above.");

							if(!newAdjRoom){
								newAdjRoom = true;
								// console.log("----------------------------------------------");
								if(map[checkX-1][checkY] == Tile.FLOOR){
									// console.log("WTF");
								}
								// console.log("Room", r.id, "checking adjacent room to top");
								// console.log("checkX:", checkX-2);
								// console.log("checkY:", checkY);
								let adjRoom = findAdjacentCell(1, checkX-2, checkY);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);//({r: adjRoom, addedBy: r.id, dir: 1, fX: checkX-2, fX: checkY});
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX-2, fY: checkY, oX: -2, oY: 0});
									r.roomToTop++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);//({r: r.id, addedBy: r.id, dir: 1, fX: checkX-2, fX: checkY});
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX-2, fY: checkY, oX: -2, oY: 0});
									rooms[adjRoom].roomToBot++;
									rooms[adjRoom].adjRoomCount++;
								}
								//console.log("New adjacent room found (top)");
							}
							
						}
						else if(map[checkX-2][checkY] == Tile.WALL || i == r.tiles.length-1){
							newAdjRoom = false;
							// console.log(r.id + " found wall (top), end of adjacent room");
							// console.log(i == r.tiles.length-1 ? true : false);
						}	
					}		
				

					if(roomToExpand){				
						for(let i = 0; i < r.tiles.length; i++){
							let newX = r.tiles[i][0].x-1;
							let newY = r.tiles[i][0].y;
							
							r.tiles[i].unshift({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							success = true;
						}
						//console.log("Room " + r.id + " expanded top.");
					}
					else{
						r.expTop = false;
					}
				}
				else{
					//console.log("FOUND OUT OF BOUNDS (TOP) ", oobCheck);
					r.expTop = false;
				}
			}
			else{
				unnecessaryChecks++;
				//console.log("Shouldn't be checking as flagged that this direction is not expandable.");
			}
			return success;
			break;
		case 2: //RIGHT
			success = false;
			if(r.expRight){
				//let l = r.tiles.length;
				let oobCheck = r.tiles[r.tiles.length-1][0].y+2;
				//console.log("oob: ", oobCheck, " mapSize: ", mapSize);
				if(oobCheck < mapSize){
					let roomToExpand = true;
					//let i = 0;

					//while(roomToExpand && i < r.tiles[0].length){
					for(let i = 0; i < r.tiles[0].length; i++){
						let checkX = r.tiles[r.tiles.length-1][i].x;
						let checkY = r.tiles[r.tiles.length-1][i].y;

						if(i == 0){
							if(map[checkX-1][checkY+1] != Tile.WALL || map[checkX-1][checkY+2] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to upper right.");
							}
						}
						else if(i == r.tiles[r.tiles.length-1].length-1){
							if(map[checkX+1][checkY+1] != Tile.WALL || map[checkX+1][checkY+2] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to lower right.");
							}
						}
						
						if(map[checkX][checkY+1] == Tile.FLOOR || 
							map[checkX][checkY+2] == Tile.FLOOR){
							roomToExpand = false;
							//console.log("Other room found to right.");
							//Found an adjacent room, so add right wall to adjacent array
							// r.sharedWalls.push({x: checkX, 
							// 	y: checkY+1,
							// 	l: r.tiles[0].length
							// });
							if(!newAdjRoom){
								newAdjRoom = true;
								// console.log("----------------------------------------------");
								if(map[checkX][checkY+1] == Tile.FLOOR){
									// console.log("WTF");
								}
								// console.log("Room", r.id, "checking adjacent room to right");
								let adjRoom = findAdjacentCell(2, checkX, checkY+2);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);//({r: adjRoom, addedBy: r.id, dir: 2, fX: checkX, fX: checkY+2});
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX, fY: checkY+2, oX: 0, oY: 2});
									r.roomToRight++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);//({r: r.id, addedBy: r.id, dir: 2, fX: checkX, fX: checkY+2});
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX, fY: checkY+2, oX: 0, oY: 2});
									rooms[adjRoom].roomToLeft++;
									rooms[adjRoom].adjRoomCount++;
								}
								//console.log("New adjacent room found (right)");
							}
							
						}
						else if(map[checkX][checkY+2] == Tile.WALL || i == r.tiles[0].length-1){
							newAdjRoom = false;
							// console.log(r.id + " found wall (right), end of adjacent room");
							// console.log(i == r.tiles[0].length-1 ? true : false);
						}	
					}		
				

					if(roomToExpand){
						let l = r.tiles.push([]); //l is new length
						for(let i = 0; i < r.tiles[1].length; i++){
							let newX = r.tiles[l-2][i].x;
							let newY = r.tiles[l-2][i].y+1;
							
							r.tiles[l-1].push({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							success = true;
						}
						//console.log("Room " + r.id + " expanded right.");
					}
					else{
						r.expRight = false;
					}
				}
				else{
					//console.log("FOUND OUT OF BOUNDS (RIGHT) ", oobCheck);
					r.expRight = false;
				}
			}
			else{
				unnecessaryChecks++;
				//console.log("Shouldn't be checking as flagged that this direction is not expandable.");
			}
			return success;
			break;
		case 3: //BOT
			success = false;
			if(r.expBot){
				//let l = r.tiles[0].length;
				let oobCheck = r.tiles[0][r.tiles[0].length-1].x+2;
				if(oobCheck < mapSize){
					let roomToExpand = true;
					//let i = 0;

					//while(roomToExpand && i < r.tiles.length){
					for(let i = 0; i < r.tiles.length; i++){
						let checkX = r.tiles[i][r.tiles[0].length-1].x;
						let checkY = r.tiles[i][r.tiles[0].length-1].y;

						if(i == 0){
							if(map[checkX+1][checkY-1] != Tile.WALL || map[checkX+2][checkY-1] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to lower left.");
							}
						}
						else if(i == r.tiles.length-1){
							if(map[checkX+1][checkY+1] != Tile.WALL || map[checkX+2][checkY+1] != Tile.WALL){
								roomToExpand = false;
								//console.log("Other room found to lower right.");
							}
						}
						
						if(map[checkX+1 ][checkY] == Tile.FLOOR || 
							map[checkX+2][checkY] == Tile.FLOOR){
							roomToExpand = false;
							//console.log("Other room found below.");
							//Found an adjacent room, so add right wall to adjacent array
							if(!newAdjRoom){
								newAdjRoom = true;
								// console.log("----------------------------------------------");
								if(map[checkX+1 ][checkY] == Tile.FLOOR){
									// console.log("WTF");
								}
								// console.log("Room", r.id, "checking adjacent room to bot");
								// console.log("checkX:", checkX+2);
								// console.log("checkY:", checkY);
								let adjRoom = findAdjacentCell(3, checkX+2, checkY);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);//({r: adjRoom, addedBy: r.id, dir: 3, fX: checkX+2, fX: checkY});
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX+2, fY: checkY, oX: 2, oY: 0});
									r.roomToBot++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);//({r: r.id, addedBy: r.id, dir: 3, fX: checkX+2, fX: checkY});
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX+2, fY: checkY, oX: 2, oY: 0});
									rooms[adjRoom].roomToTop++;
									rooms[adjRoom].adjRoomCount++;
								}
								// console.log("New adjacent room found (bot)");
							}
							
						}
						else if(map[checkX+2][checkY] == Tile.WALL || i == r.tiles.length-1){
							newAdjRoom = false;
							// console.log(r.id + " found wall (bot), end of adjacent room");
							// console.log(i == r.tiles.length-1 ? true : false);
						}	
					}

					if(roomToExpand){				
						for(let i = 0; i < r.tiles.length; i++){
							let newX = r.tiles[i][r.tiles[i].length-1].x+1;
							let newY = r.tiles[i][r.tiles[i].length-1].y;
							
							r.tiles[i].push({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							success = true;
						}
						// console.log("Room " + r.id + " expanded bot.");
					}
					else{
						r.expBot = false;
					}
				}
				else{
					// console.log("FOUND OUT OF BOUNDS (BOT) ", oobCheck);
					r.expBot = false;
				}
			}
			else{
				unnecessaryChecks++;
				// console.log("Shouldn't be checking as flagged that this direction is not expandable.");
			}
			return success;
			break;
		default:
			// console.log("invalid case number");
			break;
	}
}

//finds the room id of a room that is adjacent to another, to populate adjacency lists
function findAdjacentCell(d, cX, cY){

	//d is expansion direction of other room
	//so if d is left, we check right most values of new room

	// console.log("Finding index of adjacent room");

	//tiles indexes
	let iX;
	let iY;

	let cellFound = false;
	let p = 0;
	let chkTiles;

	let l;

	while(!cellFound && p < rooms.length){
		// console.log("p=", p)
		chkTiles = rooms[p].tiles;

		//IF ROOM IS NOT THE SAME

		if(d == 0){
			if(chkTiles[chkTiles.length-1][0].y == cY){
				let i = 0;
				while(!cellFound && i < chkTiles[chkTiles.length-1].length){
					if(chkTiles[chkTiles.length-1][i].x == cX &&
						chkTiles[chkTiles.length-1][i].y == cY){
						cellFound = true;
						// console.log("Room", p, "is left.");
					}
					i++;
				}
				// console.log("Room ", p, " has correct y. Cell found =", cellFound);
			}
		}
		else if(d == 1){
			l = chkTiles[0].length;
			if(chkTiles[0][l-1].x == cX){
				let i = 0;
				while(!cellFound && i < chkTiles.length){
					if(chkTiles[i][l-1].x == cX &&
						chkTiles[i][l-1].y == cY){
						cellFound = true;
						// console.log("Room", p, "is above.");
					}
					i++;
				}
				// console.log("Room ", p, " has correct x. Cell found =", cellFound);
			}
			else{
				// console.log("Other room x: " + chkTiles[0][l-1].x);
				// console.log("Checking room x: " + cX);
			}
		}
		else if(d == 2){
			if(chkTiles[0][0].y == cY){
				let i = 0;
				while(!cellFound && i < chkTiles[0].length){
					if(chkTiles[0][i].x == cX &&
						chkTiles[0][i].y == cY){
						cellFound = true;
						// console.log("Room", p, "is right.");
					}
					i++;
				}
				// console.log("Room ", p, " has correct y. Cell found =", cellFound);
			}
		}
		else if(d == 3){
			l = chkTiles[0].length;
			if(chkTiles[0][0].x == cX){
				let i = 0;
				while(!cellFound && i < chkTiles.length){
					if(chkTiles[i][0].x == cX &&
						chkTiles[i][0].y == cY){
						cellFound = true;
						// console.log("Room", p, "is below.");
					}
					i++;
				}
				// console.log("Room ", p, " has correct x. Cell found =", cellFound);
			}
			else{
				// console.log("Other room x: " + chkTiles[0][0].x);
				// console.log("Checking room x: " + cX);
			}
		}
		if(!cellFound){
			// console.log("Cell not found, iterating");
			p++;
		}
	}

	if(!cellFound){
		// console.log("Couldn't find cell");
	}
	else{
		// console.log("Room ", p, " is adjacent to this room.");
	}

	return p;
}

//uses adjacency list to connect rooms that are adjacent, in a random manner
function randomlyConnectAdjacentRooms(){

	//CHECK SITE FOR EXACT PROCEDURE
	//rooms to be placed = rooms
	let roomsToBePlaced = rooms.slice();
	// console.log(rooms.length);
	// console.log(rooms);
	// console.log(roomsToBePlaced);
	let placedRooms = [];
	let adjacentRoomPool = [];
	let numPlaced = 0;

	let rndRoomNum;

	//array method that could compare two arrays and return similar?

	while(numPlaced < numRooms){
		//first it: remove random room from ToBePlaced and add it to placed rooms
		//second onwards: room has been randomly selected from adjacent rooms list
		console.log("-------------------");
		console.log("New room being placed");

		// console.log(rndRoomNum);
		// console.log(roomsToBePlaced[rndRoomNum]);
		console.log("Rooms to be placed: ", roomsToBePlaced);

		//get random adjacent room from adjacentRoomPool and remove it from pool
		if(numPlaced == 0){
			rndRoomNum = Math.floor(Math.random() * roomsToBePlaced.length);
		}
		else{
			let newRoomFound =false;
			//check that is hasn't been placed already
			while(!newRoomFound){
				let ran = Math.floor(Math.random() * adjacentRoomPool.length);
				if(roomsToBePlaced.findIndex(function(room){ 
					return room.id == adjacentRoomPool[ran];}) != -1){
					rndRoomNum = adjacentRoomPool[ran];
					newRoomFound = true;
					console.log("new random number: ", ran);
					console.log("pool: ", adjacentRoomPool);
					console.log("rndRoomNum: ", rndRoomNum);
				}
			}
		}
		
		let newRoom = roomsToBePlaced.find(function(room){ return room.id == rndRoomNum;})

		placedRooms.push(newRoom);

		roomsToBePlaced.splice(roomsToBePlaced.indexOf(newRoom),1);

		console.log("Rooms to be placed: ", roomsToBePlaced);

		console.log("New Room:");
		console.log(newRoom);
		console.log(newRoom.id);

		//console.log(newRoom);
		//console.log(newRoom.adjacentRooms);
		//console.log(newRoom.adjacentRooms.length);
		
		for(let i = 0; i < newRoom.adjacentRooms.length; i++){
			//only add if unique reference
			if(adjacentRoomPool.indexOf(newRoom.adjacentRooms[i]) == -1){
				adjacentRoomPool.push(newRoom.adjacentRooms[i]);
				console.log(newRoom.adjacentRooms[i], "added to adjacentRoomPool.");
			}
		}

		numPlaced++;

		//CONNECT TWO ROOMS
		//from second placed room onwards
		if(numPlaced > 1){
			//check from pool all numbers that exist in  newRoom adjacentRooms list
			//find only those that are currently in placedRooms array (leave rest to help choose next room to be placed)
			//adds them to new list
			let availableConnections = adjacentRoomPool.filter(function(roomId){
				//new room has these connections in pool
				return newRoom.adjacentRooms.indexOf(roomId) != -1;
			})

			let possibleConnections = [];

			//if these rooms have actually been placed already
			for(let i = 0; i < placedRooms.length; i++){
				if(availableConnections.indexOf(placedRooms[i].id) != -1){
					possibleConnections.push({id: placedRooms[i].id, doors: placedRooms[i].doors});
				}
			}

			let highestDoorCount = 0;
			let tie = false;
			let roomsWithMostDoors = [];

			//finds the placed room that has the most connection already, to create hub rooms
			for(let i = 0; i < possibleConnections.length; i++){
				if(possibleConnections[i].doors > highestDoorCount){
					roomsWithMostDoors = [];
					roomWithMostDoors.push(possibleConnections[i]);
					highestDoorCount = possibleConnections[i].doors
					tie = false;
				}
				else if(possibleConnections[i].doors == highestDoorCount)
				{
					tie = true;
					roomsWithMostDoors.push(possibleConnections[i]);
				}
			}

			let connectionChoice;

			//if there is a tie, pick randomly from possible connections
			if(tie) {
				let rndConnection = Math.floor(Math.random() * roomsWithMostDoors.length);
				connectionChoice = roomsWithMostDoors[rndConnection];
			}
			else{
				connectionChoice = roomsWithMostDoors[0];
			}

			let roomToConnect = placedRooms.find(function(room){
				console.log("room.id: ",room.id);
				console.log("connectionChoice.id: ", connectionChoice.id);
				return room.id == connectionChoice.id;
			})

			console.log("Room To Connect:");
			console.log(roomToConnect);
			console.log(roomToConnect.id);

			//remove connection from pool as it has been picked
			adjacentRoomPool.splice(adjacentRoomPool.indexOf(roomToConnect.id), 1);
			adjacentRoomPool.splice(adjacentRoomPool.indexOf(newRoom.id), 1);

			//we have reference to first cell of adjacency, room.adjacentRooms[i].fX and fY
			//we have placedRooms array which contains both rooms (newRoom & roomToConnect)
			let adjacencyObj = newRoom.adjacentRoomCells.find(function(adj){
				console.log("adj.r: ", adj.r);
				console.log("roomToConnect.id: ", roomToConnect.id);
				return adj.r == roomToConnect.id;
			})

			console.log(adjacencyObj);

			//so many variables ;_;
			let roomA;	
			let roomB;

			//we're doing the checking from the other direction
			if(newRoom.id == adjacencyObj.addedBy){
				roomA = roomToConnect;
				roomB = newRoom;
			}
			else if(roomToConnect.id == adjacencyObj.addedBy){
				roomA = newRoom;
				roomB = roomToConnect;
			}
			else{
				console.log("WTF MATE");
			}

			//a lot of offsets!
			let chkTiles;
			let xOffset;
			let yOffset;
			let wOffsetX;
			let wOffsetY;
			let fX = adjacencyObj.fX;
			let fY = adjacencyObj.fY;
			let oX = adjacencyObj.oX;
			let oY = adjacencyObj.oY;
			let l;

			console.log("RoomA tiles: ", roomA.tiles);

			//work it out from fX and fY

			if(oY < 0){
				console.log("connectedRoom is to RIGHT");
				chkTiles = [];//roomA.tiles[length-1];
				l = roomA.tiles[0].length;
				for(let t = 0; t < l; t++){
					chkTiles.push(roomA.tiles[roomA.tiles.length-1][t]);
				}
				xOffset = 0;
				yOffset = 2;
				wOffsetX = 0;
				wOffsetY = 1;
				
				console.log("want to check RIGHT");
			}
			else if(oX < 0){
				console.log("connectedRoom is to BOT");
				chkTiles = [];
				l = roomA.tiles.length; 
				for(let t = 0; t < roomA.tiles.length; t++){
					chkTiles.push(roomA.tiles[t][roomA.tiles[0].length-1]);
				}
				xOffset = 2;
				yOffset = 0;
				wOffsetX = 1;
				wOffsetY = 0;

				
				console.log("want to check BOT");
			}
			else if(oY > 0){
				console.log("connectedRoom is to LEFT");
				chkTiles = [];//roomA.tiles[0];
				l = roomA.tiles[0].length;
				for(let t = 0; t < l; t++){
					chkTiles.push(roomA.tiles[0][t]);
				}
				xOffset = 0;
				yOffset = -2;
				wOffsetX = 0;
				wOffsetY = -1;
				console.log("want to check LEFT");
			}
			else if(oX > 0){
				console.log("connectedRoom is to TOP");
				chkTiles = [];
				l = roomA.tiles.length;
				for(let t = 0; t < roomA.tiles.length; t++){
					chkTiles.push(roomA.tiles[t][0]);
				}
				xOffset = -2;
				yOffset = 0;
				wOffsetX = -1;
				wOffsetY = 0;
			
				console.log("want to check TOP");
			}

			let endOfSharedWallFound = false;
			let ct = 0;
			let sharedWallLength = 0;
			let sharedWall = [];


			console.log("chkTiles: ", chkTiles);

			while(!endOfSharedWallFound && ct < l){
				//work out direction of walls, left/right or up/down
				//find out who's side the fX and fY values are on
				//check both sides until a wall intersects, meaning the shareWall is ended
				//take the length of sharedWall /2 and place doo
				
				let chkX = chkTiles[ct].x;
				let chkY = chkTiles[ct].y;

				//accounts for all directions and starts checking only from starting tile flagged by adjacency method
				//MIGHT NOT GET TOTALLY CORRECT AS POINT AT WHICH ROOMS FOUND EACH OTHER MAY BE OUTDATED WITH FURTHER EXPANDING DONE LATER
				if(chkX >= fX && chkY >= fY){
					console.log("x: ", chkX+xOffset, "y: ", chkY+yOffset, "FLOOR");
					if(map[chkX+xOffset][chkY+yOffset] == Tile.FLOOR){
						sharedWallLength++;
						sharedWall.push({x: chkX+wOffsetX, y: chkY+wOffsetY});
					}
					else{
						console.log("HIT WALL");
						endOfSharedWallFound = true;
					}
				}
				else{
					console.log("x: ", chkX+xOffset, "y: ", chkY+yOffset, "NOT RIGHT FLOOR");
				}
				ct++;
			}


			//ONLY ADD NEW DOOR IF SHAREDWALLLENGTH >= 3

			let halfWayPoint = Math.floor(sharedWallLength/2);
			let newDoorPosition = sharedWall[halfWayPoint-1];

			console.log(roomA);
			console.log(roomB);

			console.log("THE GREAT WALL:", sharedWall);
			console.log("THE GREAT DOOR POSITION:", newDoorPosition);

			map[newDoorPosition.x][newDoorPosition.y] = Tile.DOOR;
		}
	}
}







