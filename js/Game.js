'use strict';

//var Roguelike = Roguelike || {};



const mapSize = 40;
const minRoomsize = 3;
const numRooms = 20;
const floorChar = 'R';
const wallChar = 'w';
const numEnemies = 20;
const terminalNumber = 10;

//numitems
//numterminals

var game;

var floorNumber;
var floorAmount = 10;
var expThreshold;

var hud;

var gameMusic;

var map;
var floorLayer;
var blockLayer;
var objLayer;

var rooms;
var doors;

var marker;

var playerName;
var player;
//var enemy; 
var actorList;//, UI;
//var enemyList;
var actorPositions;
var terminalPositions;
var terminalList;

var enemiesKilled;
var creditsEarned;

var cursors;

var unnecessaryChecks;

(function (){

Roguelike.Game = function(){};

Roguelike.Game.prototype = {
	create: function(){

		game = this.game;

		if(floorNumber == null){
			floorNumber = 1;
		}
		else{
			floorNumber++;
		}
		
		expThreshold = 3000;

		//call createLevel(floorNumber);
		//createLevel calls:
		//INITMAP() which calls expand and connect methods
		//INITACTORS()
		//INIT WORLD OBJECTS()
		//DRAW MAP()
		//INIT HUD()

		//if move into exit, call initMap(++floorNumber);

		//set up map array
		initMap();
		expandRandomRooms(); //also populates room adjacency lists
		randomlyConnectAdjacentRooms(); //use room adjency list to add doors connecting the rooms

		//console.log("tile: ", tMap.getTile(0,0));

		//Area outside of level is only to the right/bot of the map, as map is placed at 0,0
		this.game.world.resize(4800, 4800);


		//GROUPS?
		//do I even need tilemap?

		//EVEN USING GROUPS?
		blockLayer = this.game.add.group();
		floorLayer = this.game.add.group();
		objLayer = this.game.add.group();

		//DEF NEEDED TO ADD FOG OF WAR TO UNEXPLORED ROOMS

		for(let x = 0 ; x < mapSize; x++){
			for(let y = 0; y< mapSize; y++){
				if(map[x][y] == '.'){
					//floorLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'floorTile'));
					let floor = floorLayer.create(y*64, x*64, 'floorTile');
					//console.log("floor tile added");
				}
				else if(map[x][y] == '#'){
					//objLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'wallTile'));
					let wall = blockLayer.create(y*64, x*64, 'wallTile');
					//console.log("wall tile added");
				}
				else if(map[x][y] == 'D'){
					//objLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'doorTile'));
					let door = objLayer.create(y*64, x*64, 'doorTile');
					//console.log("door tile added");
				}
			}
		}



		// let exit = this.game.add.sprite(0*64, 1*64, 'doorTile'); 
		// map[0][1] = Tile.EXIT;

		//CREATE TERMINALS METHOD

		let ranPos;

		terminalPositions = [];
		terminalList = [];

		for(let t = 0; t < terminalNumber; t++){
			//NEED TO NOT BLOCK DOORS + IDEALLY NOT PUT MORE THAN ONE IN A ROOM
			ranPos = getRandomCoords(rooms);
			let options = ["Heal", "Unlock Door", "Upgrade"];
			let terminal = new Terminal(this.game, options, ranPos.y, ranPos.x)
			map[ranPos.y][ranPos.x] = Tile.TERMINAL;
			terminalPositions.push(ranPos.x + '_' + ranPos.y); 
			terminalList.push(terminal);
			//console.log(terminal.options);
		}


		//PLACE EXIT
		//based on player starting position, pick wall furthest away (perimeter of map) and place exit randomly on that wall
		//it must be adjacent to a floor cell so it is reachable


		//ACTOR INITIALISATION SHOULD BE IN A METHOD

		ranPos = getRandomCoords(rooms);
		
		//actorList = [];
		actorPositions = [];
		actorList = [];

		playerName = localStorage.getItem("playerName");
		player = new Player(this.game, playerName, ranPos.y, ranPos.x, 100);
		actorPositions.push(ranPos.x + '_' + ranPos.y); 

		//FOR EXIT TESTING
		// if(player == null){
		// 	player = new Player(this.game, playerName, 1, 1, 100);
		// }
		
		actorPositions.push(1 + '_' + 1); 
		//////

		actorList.push(player);

		//this could be condensed so that if i == 0, create player, else enemy
		
		player.sprite.animations.add('walkLeft', [9, 10, 11, 12, 13, 14, 15, 16, 17], 18, false);
		player.sprite.animations.add('walkUp', [0, 1, 2, 3, 4, 5, 6, 7, 8], 18, false);
		player.sprite.animations.add('walkRight', [27, 28, 29, 30, 31, 32, 33, 34, 35], 18, false);
		player.sprite.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 24, 25, 26], 18, false);
		player.sprite.anchor.y = 0.3 ;

		//enemyList = [];

		for(let e = 0; e < numEnemies; e++){
			ranPos = getRandomCoords(rooms);
			let enemy = new Enemy(this.game, ranPos.y, ranPos.x, 50);
			
			actorList.push(enemy);
			actorPositions.push(ranPos.x + '_' + ranPos.y);//not sure which way around

			enemy.sprite.animations.add('walkLeft', [9, 10, 11, 12, 13, 14, 15, 16, 17], 60, false);
			enemy.sprite.animations.add('walkUp', [0, 1, 2, 3, 4, 5, 6, 7, 8], 60, false);
			enemy.sprite.animations.add('walkRight', [27, 28, 29, 30, 31, 32, 33, 34, 35], 60, false);
			enemy.sprite.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 24, 25, 26], 60, false);
			enemy.sprite.anchor.y = 0.3 ;
		}

		//for level change, the enemiesKilled should be persistant
		//if(enemiesKilled == null){
			enemiesKilled = 0;
		//}

		//for level change, the enemiesKilled should be persistant
		//if(creditsEarned == null){
			creditsEarned = 0;
		//}

		//player.sprite.scale.setY(2, 1);
		// player.sprite.width = 64;
		// player.sprite.height = 64;

		console.log(player);
		//console.log(this.player.sprite);


		//this.game.physics.arcade.enable(this.player.sprite);
		// this.player.sprite.enableBody = true;
		// this.player.sprite.body.collideWorldBounds = true;
		// this.player.sprite.body.setCollisionGroup(playerCollisionGroup);
		

		this.game.physics.enable(player.sprite, Phaser.Physics.ARCADE);
		//this.player.sprite.body.setSize(......);

		//this.player.sprite.body.collides()


		// this.game.physics.startSystem(Phaser.Physics.P2JS);
		// this.game.physics.p2.enable(this.player.sprite);

		this.game.camera.follow(player.sprite);
		//SHOULD HAVE AN OFFSET TO KEEP PLAYER IN CENTER OF VIEW PORT (HUD COVERS A COUPLE OF CELLS)

		//
		//this.player.body.collideWorldBounds = true;
		//


		////HUD STUFF
		//create new HUD object, pass in initial values
		//send group to top

		hud = new HUD(this.game);
		hud.initHUD("Replicants are either a benefit or a hazard.", playerName, player.hp, player.ap, player.credits, floorNumber, {}, {});

		// this.player.sprite = this.game.add.sprite(this.player.x * 32, this.player.y * 32, this.player.sprite, 19);

		//set up mouse button listener + callback
		//on click_up, check if valid move, if so move them/attack
		//ai takes move
		
		//also set up keyboard listener + callbacks

		cursors = this.game.input.keyboard.createCursorKeys();
		this.input.keyboard.addCallbacks(null, null, this.onKeyUp);
		// this.input.setMoveCallback(this.mouseCallback, this);

		// this.game.input.addMoveCallback(updateMarker, this);
		
		//this.input.mouse.mouseDownCallback = this.onMouseUp();

		this.input.onTap.add(this.onMouseTap, this);

		//showGameOverScreen();

		//Highlight cells, call updateMarker to tell it which cell to highlight (where the mouse is pointing)

		//initActors();

		console.log("New Game Started");
	},
	update: function(){

	},
	onKeyUp: function(event){

		let acted = false;
		let useTerminal = false;
		let tX;
		let tY;

		// if(!this.player.isAlive()){
		// 	//game should have ended
		// 	return;
		// }
		//console.log("onKeyUp");
		//console.log(player);
		//console.log(this.player);

		console.log("Player x: ", player.x, "Player y: ", player.y);

		switch(event.keyCode){
			case Phaser.Keyboard.LEFT:
				console.log("LEFT");
				console.log("mX: ", player.x, "mY:", player.y-1);
				if(validMove(player.x, player.y-1)){
					acted = moveTo(player, 0, {x: 0, y: -1});
				}
				else if(map[player.x][player.y-1] == Tile.TERMINAL){
					useTerminal = true;
					tX = player.x;
					tY = player.y-1;
				}
				break;
			case Phaser.Keyboard.UP:
				console.log("UP");
				console.log("mX: ", player.x-1, "mY:", player.y);
				if(validMove(player.x-1, player.y)){
					acted = moveTo(player, 0, {x: -1, y: 0});
				}
				else if(map[player.x-1][player.y] == Tile.TERMINAL){
					useTerminal = true;
					tX = player.x-1;
					tY = player.y;
				}
				break;
			case Phaser.Keyboard.RIGHT:
				console.log("RIGHT");
				console.log("mX: ", player.x, "mY:", player.y+1);
				if(validMove(player.x, player.y+1)){
					acted = moveTo(player, 0, {x: 0, y: 1});
				}
				else if(map[player.x][player.y+1] == Tile.TERMINAL){
					useTerminal = true;
					tX = player.x;
					tY = player.y+1;
				}
				break;
			case Phaser.Keyboard.DOWN:
				console.log("DOWN");
				console.log("mX: ", player.x+1, "mY:", player.y);
				if(validMove(player.x+1, player.y)){
					acted = moveTo(player, 0, {x: +1, y: 0});
				}
				else if(map[player.x+1][player.y] == Tile.TERMINAL){
					useTerminal = true;
					tX = player.x+1;
					tY = player.y;
				}
				break;
			default: 
				break;
		}
		
		console.log("AP: " + player.ap);

		if(useTerminal){
			console.log("using terminal");
			let terminalIndex = terminalPositions.indexOf(tY + "_" + tX);
			let terminal = terminalList[terminalIndex];
			terminal.displayTerminal();
			//counts as an action, can deduct ap once they choose option
		}

		if(acted){
			player.ap -= 1;
			hud.updateAP(player.ap);
			//UPDATE HUD
		}

		if(Math.floor(player.ap) == 0){
			console.log("AI TURN, AP: " + player.ap);
			//AI TURN
			for(let i = 1; i <= numEnemies; i++){
				let e = actorList[i];
				if(e.isAlive){
					aiAct(e, i);
				}
			}
			player.ap = player.maxAP;
			hud.updateAP(player.ap);
			//update HUD
		}
	},
	onMouseTap: function(pointer, doubleTap){
		//console.log("mouse tap");

		let tileY = Math.floor(Roguelike.game.input.activePointer.worldX/64);
		let tileX = Math.floor(Roguelike.game.input.activePointer.worldY/64);

		//console.log("tileX: ", tileX, "tile Y: ", tileY);

		let dX = tileX - player.x;
		let dY = tileY - player.y;

		//if abs DX+DY == 2
		//call keyboard control handler twice
		//possible directions: 4 diagonals, left twice, up twice, right twice, down twice
		//lose 1 ap per move



		//if ap > 0 try move

		if(Math.floor(player.ap) > 0){
			if(dX == -1 && dY == 0){ //move up
				//console.log("up");
				this.onKeyUp({keyCode: Phaser.Keyboard.UP});
				//player.ap -=1;
				//console.log(player.ap);
			}
			else if (dX == -2 && dY == 0){
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.UP});
					this.onKeyUp({keyCode: Phaser.Keyboard.UP});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.UP});
				}
			} 
			else if(dX == 1 && dY == 0){ //move down
				//console.log("up");
				this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
				//player.ap -=1;
			}
			else if(dX == 2 && dY == 0){ //double move up
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
					this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
				}
				//player.ap -= 2;
			}
			else if(dX == 0 && dY == 1){ //move right
				//console.log("up");
				this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
				//player.ap -= 1;
				// 	
			}
			else if(dX == 0 && dY == 2){ 	//double move right
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
					this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
				}
				//player.ap -= 2;
			}	
			else if(dX == 0 && dY == -1){ //move left
				//console.log("up");
				this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
				//player.ap -= 1;
					
			}
			else if(dX == 0 && dY == -2){
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
					this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
				}
				//player.ap -=2;
			}


			//DIAGONALS
			//TRY BOTH POSSIBLE FIRST DIRECTIONS, IE UP THEN LEFT TO GET DIAGONAL UP LEFT
		}	
	},
	gameOver: function(){}
};

function HUD(game){//, messages, name, hp, ap, credits, floor, weapon, equipment){
	this.game = game;
	this.hudReadout = [];// = messages;
	this.readout0;
	this.readout1;
	this.readout2;
	this.readout3;
	this.hudName;// = name;
	this.hudHP;// = hp;
	this.hudAP;// = ap;
	this.hudCredits;// = credits;
	this.hudFloor;// = floor;
	this.hudWeapon;// = weapon;
	this.hudEquipment;// = equipment;
};

HUD.prototype = {
	initHUD: function(message, name, hp, ap, credits, floor, weapon, equipment){
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0x333333);
	   	graphics.lineStyle(1, 0x777777, 1);
	   	let hudBackground = graphics.drawRect(0, this.game.height-101, this.game.width-1, 100);
	   	hudBackground.fixedToCamera = true;
	   	graphics.endFill();

	   	//console.log(this.game.height);
	   	//console.log(this.game.width);

	   	this.updateReadout(message);
	   	this.updateName(name);
	   	this.updateHP(hp);
	   	this.updateAP(ap);
	   	this.updateCredits(credits);
	   	this.updateFloor(floor);
	   	this.updateWeapon(weapon);
	   	this.updateEquipment(equipment);

	},
	updateReadout: function(message){

		//IF SPACE IN READOUTS AREA, ADD NEW MESSAGE TO TOP, SHIFT ALL DOWN (USE UNSHIFT?)
		//IF NOT SPACE, POP LAST ONE/s, ADD NEW ONES

		if(this.hudReadout.length < 4){
			this.hudReadout.unshift(message);
		}
		else{
			this.hudReadout.pop();
			this.hudReadout.unshift(message);
		}

		console.log(this.hudReadout);

		var style = {font: "12px Consolas", fill: "#fff", align: "left"};
	
		let y = this.game.height-81;
		let r;

		//console.log(this.readout0);

		if(this.readout0 != null){
			console.log("existing readout0 destroyed");
			this.readout0.destroy()
		}
		if(this.readout1 != null){
			this.readout1.destroy()
		}
		if(this.readout2 != null){
			this.readout2.destroy()
		}
		if(this.readout3 != null){
			this.readout3.destroy()
		}

		for(let m = 0; m < this.hudReadout.length; m++){
			if(m == 0){
				//r = this.readout0;
				this.readout0 = this.game.add.text(5, y, this.hudReadout[m], style);
				this.readout0.fixedToCamera = true;
			}
			else if(m == 1){
				//r = this.readout1;
				this.readout1 = this.game.add.text(5, y, this.hudReadout[m], style);
				this.readout1.fixedToCamera = true;
			}
			else if(m == 2){
				//r = this.readout2;
				this.readout2 = this.game.add.text(5, y, this.hudReadout[m], style);
				this.readout2.fixedToCamera = true;
			} 
			else if(m == 3){
				//r = this.readout3;
				this.readout3 = this.game.add.text(5, y, this.hudReadout[m], style);
				this.readout3.fixedToCamera = true;
			} 
			console.log(this.hudReadout[m]);
			y += 18;
		}
	},
	updateName: function(name){
		var style = {font: "18px Consolas", fill: "#fff", align: "left"};

		this.hudName = this.game.add.text(this.game.width/2, this.game.height-90, "Name: " + playerName, style);
		//t.anchor.set(0.5);
		this.hudName.fixedToCamera = true;
	},
	updateHP: function(hp){
		var style = {font: "18px Consolas", fill: "#fff", align: "left"};

		if(this.hudHP != null){
			this.hudHP.destroy();
		}

		//ADD RED RECTANGLE OF CERTAIN WIDTH, FIXED HEIGHT
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0xFF0000);
	   	//graphics.lineStyle(1, 0x880000, 1);
	   	this.hudHP = graphics.drawRect((this.game.width/2), this.game.height-72, hp, 18);
	   	this.hudHP.fixedToCamera = true;
	   	graphics.endFill();

		//this.hudHP = this.game.add.text((this.game.width/2), this.game.height-72, "HP: " + player.hp, style);
		//t.anchor.set(0.5);
		this.hudHP.fixedToCamera = true;
	},
	updateAP: function(ap){
		var style = {font: "18px Consolas", fill: "#fff", align: "left"};
		//change to x number of images, hide when ap is used, show again once ap is regained
		
		if(this.hudAP != null){
			this.hudAP.destroy();
		}

		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xFF9900);

		let x = this.game.width/2;

		for(let a = 0; a < ap; a++){
			this.hudAP = graphics.drawRect(x, this.game.height-54, 40, 18);
			x += 45;
		}

	 	//graphics.lineStyle(1, 0x880000, 1);
	 	
	   	this.hudAP.fixedToCamera = true;
	   	graphics.endFill();
		
		//this.hudAP = this.game.add.text((this.game.width/2), this.game.height-54, "AP: " + player.ap, style);
		//t.anchor.set(0.5);
		//this.hudAP.fixedToCamera = true;
	},
	updateCredits: function(credits){
		var style = {font: "18px Consolas", fill: "#fff", align: "left"};

		if(this.hudCredits != null){
			this.hudCredits.destroy();
		}

		this.hudCredits = this.game.add.text((this.game.width/2), this.game.height-36, "Credits: " + player.credits, style);
		//t.anchor.set(0.5);
		this.hudCredits.fixedToCamera = true;
	},
	updateFloor: function(floor){
		var style = {font: "18px Consolas", fill: "#fff", align: "left"};

		if(this.hudFloor != null){
			this.hudFloor.destroy();
		}

		this.hudFloor = this.game.add.text((this.game.width/2), this.game.height-18, "Floor " + floorNumber + " of " + floorAmount, style);
		//t.anchor.set(0.5);
		this.hudFloor.fixedToCamera = true;
	},
	updateWeapon: function(weapon){
		var style = {font: "18px Consolas", fill: "#fff", align: "left"};

		if(this.hudWeapon != null){
			this.hudWeapon.destroy();
		}

		this.hudWeapon = this.game.add.text(this.game.width-200, this.game.height-63, "Weapon", style);
		//t.anchor.set(0.5);
		this.hudWeapon.fixedToCamera = true;
	},
	updateEquipment: function(equipment){
		var style = {font: "18px Consolas", fill: "#fff", align: "left"};

		if(this.hudEquipment != null){
			this.hudEquipment.destroy();
		}

		this.hudEquipment = this.game.add.text((this.game.width-100), this.game.height-63, "Armor", style);
		//t.anchor.set(0.5);
		this.hudEquipment.fixedToCamera = true;
	},
};

function aiAct(e, index){

	let dx = e.x - player.x;
	let dy = e.y - player.y;

	//NEED TO CHECK FOR WALLS THAT WOULD OBSCURE SIGHT

	if(!e.alerted && Math.abs(dx) + Math.abs(dy) <= 5)
	{
		e.alerted = true;
	}
	
	let posX;
	let posY;
	let rndChoice;

	if(e.alerted){
		//dum tracking
		//checks what direction the player is in
		//if diagonal, chooses randomly between up/down and left/right
		//if in a straight line direction, chooses that direction

		if(dx < 0){ //player is below
			if(dy > 0){
				rndChoice = Math.floor(Math.random() * 2);
				if(rndChoice == 0){
					posX = 0;
					posY = -1;
				}
				else{
					posX = 1;
					posY = 0;
				}
			}
			else if(dy < 0){
				rndChoice = Math.floor(Math.random() * 2);
				if(rndChoice == 0){
					posX = 0;
					posY = 1;
				}
				else{
					posX = 1;
					posY = 0;
				}
			}
			else if(dy ==0){
				posX = 1;
				posY = 0;
			}
		}
		else if(dx > 0){ //player is above
			if(dy > 0){
				rndChoice = Math.floor(Math.random() * 2);
				if(rndChoice == 0){
					posX = 0;
					posY = -1;
				}
				else{
					posX = -1;
					posY = 0;
				}
			}
			else if(dy < 0){
				rndChoice = Math.floor(Math.random() * 2);
				if(rndChoice == 0){
					posX = 0;
					posY = 1;
				}
				else{
					posX = -1;
					posY = 0;
				}
			}
			else if(dy == 0){
				posX = -1;
				posY = 0;
			}
		}
		else if(dx == 0){ //player is to the sides
			if(dy < 0){
				posX = 0;
				posY = 1;
			}
			else if(dy > 0){
				posX = 0;
				posY = -1;
			}
		}
	
	}
	else{
		//walk randomly
		let rndDir = Math.floor(Math.random() * 4);
		//console.log("random dir: ", rndDir);
		switch(rndDir){
			case 0:
				posX = 0;
				posY = -1;
				break;
			case 1:
				posX = -1;
				posY = 0;
				break;
			case 2:
				posX = 0;
				posY = 1;
				break;
			case 3:
				posX = 1;
				posY = 0;
				break;
			default:
				break;
		}
		//console.log("enemy x: ", e.x, "enemy y: ", e.y);
		//console.log("pos x: ", posX, "pos y: ", posY);
	}

	if(validMove(e.x + posX, e.y + posY)){
		moveTo(e, index, {x: posX, y: posY});
	}
};

function getRandomCoords(rooms){
	
	let emptyCell = false;	
	let rndRoom;
	let rndRoomX;
	let rndRoomY;

	//NEED TO HAVE SOME WAY OF CHECKING FOR OTHER ACTORS/OBJECTS SO DON'T PLACE ON THEM
	while(!emptyCell){
		rndRoom = rooms[Math.floor(Math.random() * rooms.length)];
		rndRoomX = rndRoom.tiles[0][Math.floor(Math.random() * rndRoom.tiles[0].length)].x;
		rndRoomY = rndRoom.tiles[Math.floor(Math.random() * rndRoom.tiles.length)][0].y;
		if(map[rndRoomY][rndRoomX] == Tile.FLOOR){
			emptyCell = true;
		}
	}
	
	//console.log("rndRoomX", rndRoomX);
	//console.log("rndRoomY", rndRoomY);

	return {x: rndRoomX, y: rndRoomY};
};

function moveTo(actor, index, dir){

	//all actors can use the same if statement, need to set up sprites and actor types

	let newPosX = actor.x;	
	let newPosY = actor.y;

	let cellOccupied;
	let actorKilled;

	// //handle if trying to move to occupied space, should be done before actor.x and actor.y are changed
	// //could use temp x and y values for checking
	// let actorFind = actorPositions.indexOf(mX + "_" + mY);

	// if(actorFind != -1){
	// 	if()
	// }

	//console.log("In moveTo");
	// if(actor == player){
	if(dir.x == 0 && dir.y == -1){
		newPosY -= 1;
		cellOccupied = checkCellOccupied(actor.x, newPosY);
		//IF TERMINAL, OPEN TERMINAL SCREEN (IF PLAYER)
		if(cellOccupied){
			//attacks and checks if they died, leaving space free to move into
			actorKilled = attackActor(actor, actor.x, newPosY);
		}
		if(actorKilled || !cellOccupied){
			actor.sprite.animations.play('walkLeft');
		}
	}
	else if(dir.x == -1 && dir.y == 0){
		newPosX -= 1;
		cellOccupied = checkCellOccupied(newPosX, actor.y);
		//IF TERMINAL, OPEN TERMINAL SCREEN (IF PLAYER)
		if(cellOccupied){
			//attacks and checks if they died, leaving space free to move into
			actorKilled = attackActor(actor, newPosX, actor.y);
		}
		if(actorKilled || !cellOccupied){
			actor.sprite.animations.play('walkUp');
		}
	}
	else if(dir.x == 0 && dir.y == 1){
		newPosY += 1;
		cellOccupied = checkCellOccupied(actor.x, newPosY);
		//IF TERMINAL, OPEN TERMINAL SCREEN (IF PLAYER)
		if(cellOccupied){
			//attacks and checks if they died, leaving space free to move into
			actorKilled = attackActor(actor, actor.x, newPosY);
		}
		if(actorKilled || !cellOccupied){
			actor.sprite.animations.play('walkRight');
		}
	}
	else if(dir.x == 1 && dir.y == 0){
		newPosX += 1;
		cellOccupied = checkCellOccupied(newPosX, actor.y);
		//IF TERMINAL, OPEN TERMINAL SCREEN (IF PLAYER)
		if(cellOccupied){
			//attacks and checks if they died, leaving space free to move into
			actorKilled = attackActor(actor, newPosX, actor.y);
		}
		if(actorKilled || !cellOccupied){
			actor.sprite.animations.play('walkDown');
		}
	}

	if(actorKilled || !cellOccupied){
		//only move sprite and change x and y position of actor
		//if cell is free to move into

		actorPositions[index] = newPosX + '_' + newPosY;

		//seems redundant to have multiple records of actor x and y
		actor.x = newPosX;
		actor.y = newPosY;
	
		//actor.sprite.y = newPosX*64;
		//actor.sprite.x = newPosY*64;

		Roguelike.game.add.tween(actor.sprite).to({x: newPosY*64, y: newPosX*64}, 500).start();

		if(actor == player){
			console.log("New position, x:" , newPosX , "and y:", newPosY);
		}
	}

	return true;
};

function checkCellOccupied(x, y){
	//returns true if x and y are in the actorPositions list
	//ie an actor is at those coords
	return actorPositions.indexOf(x + "_" + y) != -1;
};

function attackActor(aggressor, x, y){
	let victimIndex = actorPositions.indexOf(x + "_" + y);
	let victim = actorList[victimIndex];
	let victimDead = false;

	let playerDead = false;

	if(victim != player && aggressor != player){
		//do nothing, victim is friend 
	}
	else{
		console.log(aggressor);
		console.log(actorPositions[victimIndex]);
		victim.hp -= aggressor.dmg;
		if(victim == player){
			hud.updateReadout("Ouch, I took " + aggressor.dmg + " damage ;_;");
		}
		else{
			hud.updateReadout("I did " + aggressor.dmg + " damage to the enemy d:)");
		}


		console.log(victim.hp);
		if(victim.hp <= 0){
			victimDead = true;
			//actorList.splice(victimIndex, 1);
			actorList[victimIndex].isAlive = false;
			actorPositions.splice(victimIndex, 1);
			if(victim == player){
				//game.state.start('gameOver');
				player.sprite.kill();
				player.sprite = game.add.sprite(player.y*64, player.x*64, 'playerDeath', 0); 
				player.sprite.anchor.y = 0.3 ;
				player.sprite.animations.add('playerDeath', [0, 1, 2, 3, 4, 5], 18, false);
				player.sprite.animations.play('playerDeath');
				console.log("GAME OVER");
				playerDead = true;
				//game.state.start("MainMenu");
			}
			else{
				player.score += 100;
				player.exp += 1000;
				hud.updateReadout("Enemy Down.");
				if(player.exp >= expThreshold){
					//UPDATE HUD
					player.lvl++;
					player.maxHP += 20;
					player.dmg += 5;

					//player.maxAP += 0.5;
					//if max ap is now a full level higher, updateHUD

					expThreshold += 3000;
					hud.updateReadout("I feel stronger.");
					console.log("LEVEL UP!");
					console.log(player);
				}
				player.credits += 50;
				creditsEarned += 50;
				hud.updateCredits(player.credits + 50);
				victim.sprite.kill();
				victim.sprite = game.add.sprite(victim.y*64, victim.x*64, 'armorDeath', 0); 
				victim.sprite.anchor.y = 0.3 ;
				victim.sprite.animations.add('armorDeath', [0, 1, 2, 3, 4, 5], 18, false);
				victim.sprite.animations.play('armorDeath');
				console.log("Enemy Killed");
				enemiesKilled++;
			}
			// victim.sprite = game.add.sprite(player.y*64, player.x*64, 'armorDeath', 0); 
			// victim.sprite.animations.add('armorDeath', [0, 1, 2, 3, 4, 5], 18, false);
			// victim.sprite.animations.play('armorDeath');
			
			
			//victim.sprite.kill();

			//victim.sprite.kill();
		}
		if(victim == player){
			hud.updateHP(player.hp);//change HUD to reflect new health total
		}
	}

	if(playerDead){
		showGameOverScreen();
	}
	else{
		return victimDead;
	}
};

function showGameOverScreen(){
	let gameOverGroup = game.add.group();

	let graphics = game.add.graphics(0, 0);

	graphics.beginFill(0x000000);
   	graphics.lineStyle(1, 0x777777, 1);
   	let gameOverBackground = graphics.drawRect(100, 100, game.width-200, game.height-200);
   	gameOverBackground.fixedToCamera = true;
   	graphics.endFill();

   	let textGroup = game.add.group();

   	let gameOverText = "Game Over"
   	let statsText = "Stats";
   	let killedText = "Enemies Killed: " + enemiesKilled;
   	let scoreText = "Score: " + player.score;
   	let creditsText = "Credits earned: " + creditsEarned;
   	let levelText = "Level: " + player.lvl;
   	let floorsClearedText = "Floors cleared: " + --floorNumber;
   	let returnText = "Return to menu?";
   	let restartText = "Restart?";

   	let optionPicked = false;

   	gameOverText = game.add.text(game.width/2, game.height/2-100, gameOverText, { font: "40px Arial", fill: "#19de65" }, textGroup);
   	gameOverText.fixedToCamera = true;
   	gameOverText.anchor.x = 0.5;

   	statsText = game.add.text(game.width/2, game.height/2-60, statsText, { font: "24px Arial", fill: "#19de65" }, textGroup);
   	statsText.fixedToCamera = true;
   	statsText.anchor.x = 0.5;

   	killedText = game.add.text(game.width/2, game.height/2-40, killedText, { font: "18px Arial", fill: "#19de65" }, textGroup);
   	killedText.fixedToCamera = true;
   	killedText.anchor.x = 0.5;

   	scoreText = game.add.text(game.width/2, game.height/2-20, scoreText, { font: "18px Arial", fill: "#19de65" }, textGroup);
   	scoreText.fixedToCamera = true;
   	scoreText.anchor.x = 0.5;

   	creditsText = game.add.text(game.width/2, game.height/2, creditsText, { font: "18px Arial", fill: "#19de65" }, textGroup);
   	creditsText.fixedToCamera = true;
   	creditsText.anchor.x = 0.5;

   	levelText = game.add.text(game.width/2, game.height/2+20, levelText, { font: "18px Arial", fill: "#19de65" }, textGroup);
   	levelText.fixedToCamera = true;
   	levelText.anchor.x = 0.5;

   	floorsClearedText = game.add.text(game.width/2, game.height/2+40, floorsClearedText, { font: "18px Arial", fill: "#19de65" }, textGroup);
   	floorsClearedText.fixedToCamera = true;
   	floorsClearedText.anchor.x = 0.5;

	returnText = game.add.text(game.width/2, game.height/2+60, returnText, { font: "24px Arial", fill: "#19de65" }, textGroup);
	returnText.fixedToCamera = true;
	returnText.inputEnabled = true;
	returnText.anchor.x = 0.5;
	returnText.events.onInputDown.add(function(){textGroup.destroy(); graphics.destroy(); game.state.start('MainMenu');}, this);
	returnText.events.onInputOver.add(function(){returnText.fill = "#FF0000";}, this);
	returnText.events.onInputOut.add(function(){returnText.fill = "#19de65";}, this);

	restartText = game.add.text(game.width/2, game.height/2+100, restartText, { font: "32px Arial", fill: "#19de65" }, textGroup);
	restartText.fixedToCamera = true;
	restartText.inputEnabled = true;
	restartText.anchor.x = 0.5
	restartText.events.onInputDown.add(function(){; textGroup.destroy(); graphics.destroy(); game.state.start('Game')}, this);
	restartText.events.onInputOver.add(function(){restartText.fill = "#FF0000";}, this);
	restartText.events.onInputOut.add(function(){restartText.fill = "#19de65";}, this);

}


function validMove(mX, mY){
	//console.log("in valid move");
	//console.log("mX: ", mX, "mY", mY);
	//console.log("map x: ", m))

	//TERMINAL SHOULD ALSO BLOCK

	if(map[mX][mY] == Tile.WALL){
		//console.log("found wall");
		return false;
	}
	else if(map[mX][mY] == Tile.DOOR){
		//console.log("found door");
		//handle if door locked
	}
	else if(map[mX][mY] == Tile.TERMINAL){
		return false;
	}
		
	return true;
};

var Tile = {
	WALL: '#',
	FLOOR: '.',
	DOOR: 'D',
	PLAYER: 'P',
	EXIT: 'X',
	TERMINAL: 'T'
};

//room object that holds id, coordinates in map, adjacent rooms and expansion information
function Room(num){
	this.id = num;
	this.tiles = [];
	this.x; //initialise?
	this.y;
	this.expLeft = true;
	this.expTop = true;
	this.expRight = true;
	this.expBot = true;
	this.canExp = true;
	this.doors = 0;
	this.adjacentRooms = [];
	this.adjacentRoomCells = [];
	this.adjRoomCount = 0;
	this.roomToLeft = 0;
	this.roomToTop = 0;
	this.roomToRight = 0;
	this.roomToBot = 0;
	//methods?
};

function Terminal(game, options, x, y){
	this.game = game;
	this.options = options;
	this.sprite = this.game.add.sprite(y*64, x*64, 'terminal1'); 
	//difficulty?
	//healPlayer
	//unlock room door
	//upgrade weapon/armor
	//
};

Terminal.prototype = {
	displayTerminal: function(){

		//https://phaser.io/examples/v2/text/display-text-word-by-word
		//http://phaser.io/examples/v2/input/button-open-popup
		let text;

		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0x000000);
	   	graphics.lineStyle(1, 0x777777, 1);
	   	let terminalBackground = graphics.drawRect(100, 100, this.game.width-200, this.game.height-200);
	   	terminalBackground.fixedToCamera = true;
	   	graphics.endFill();

	   	let bootText = "Booting into P.R.A.S.H system, please wait.....";
	   	let fillerText = ".....";
	   	let welcomeText = "Welcome " + playerName + " please choose from one of the following options:";

	   	text = this.game.add.text(this.game.width/2-125, this.game.height/2-100, bootText, { font: "15px Arial", fill: "#19de65" });
	   	text.fixedToCamera = true;
	  	text = this.game.add.text(this.game.width/2, this.game.height/2-80, fillerText, { font: "15px Arial", fill: "#19de65" });
   		text.fixedToCamera = true;
   		text = this.game.add.text(this.game.width/2, this.game.height/2-60, fillerText, { font: "15px Arial", fill: "#19de65" });
   		text.fixedToCamera = true;
   		text = this.game.add.text(this.game.width/2-200, this.game.height/2-40, welcomeText, { font: "15px Arial", fill: "#19de65" });
   		text.fixedToCamera = true;

		let healText = this.game.add.text(this.game.width/2, this.game.height/2, this.options[0], { font: "15px Arial", fill: "#19de65" });
		healText.fixedToCamera = true;
		healText.inputEnabled = true;
		healText.events.onInputDown.add(this.healPlayer, this);
		healText.events.onInputOver.add(this.overOption, this);
		healText.events.onInputOut.add(this.outOption, this);


		// text = this.game.add.text(100, 120, this.options[1], { font: "15px Arial", fill: "#19de65" });
		// text.fixedToCamera = true;
		// text = this.game.add.text(100, 140, this.options[2], { font: "15px Arial", fill: "#19de65" });
		// text.fixedToCamera = true;
	},
	healPlayer: function(){
		console.log("Terminal heal");
		if(player.hp + 50 <= player.maxHP){
			player.hp += 50;
		}
		else{
			player.hp = player.maxHP;
		}
		hud.updateHP(player.hp);

	},
	overOption: function(item){
		item.fill = "#FF0000";
	},
	outOption: function(item){
		item.fill = "#19de65";
	}
};

//player and enemy 'inherit' from Actor?
function Player(game, name, x, y, hp){
	this.game = game;
	this.name = name;
	this.x = x;	
	this.y = y;
	this.maxHP = hp;
	this.hp = hp;
	this.dmg = 25;
	this.maxAP = 2;
	this.ap = 2;
	this.score = 0;
	this.lvl = 1;
	this.exp = 0;
	this.credits = 0;
	this.sprite = this.game.add.sprite(y*64, x*64, 'player', 19); 
	this.isAlive = true;
};

function Enemy(game, x, y, hp){
	this.game = game;
	this.x = x;	
	this.y = y;
	this.hp = hp;
	this.dmg = 20;
	this.sprite = this.game.add.sprite(y*64, x*64, 'armor1', 19); 
	this.isAlive = true;
	this.alerted = false;
};

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
};

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
};

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
};

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
};

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
};

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

	doors = [];

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


			//for time being, door can be placed if sharedwall only has one tile, not ideal though
			if(sharedWall.length == 1){
				map[sharedWall[0].x][sharedWall[0].y] = Tile.Door;
				doors.push({x: sharedWall[0].x, y: sharedWall[0].y});
			}
			else{
				let halfWayPoint = Math.floor(sharedWallLength/2);
				let newDoorPosition = sharedWall[halfWayPoint-1];

				console.log(roomA);
				console.log(roomB);

				console.log("THE GREAT WALL:", sharedWall);
				console.log("THE GREAT DOOR POSITION:", newDoorPosition);

				map[newDoorPosition.x][newDoorPosition.y] = Tile.DOOR;
				doors.push({x: newDoorPosition.x, y: newDoorPosition.y});
			}
		}
	}
}


}());




