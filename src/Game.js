'use strict';

var Roguelike = Roguelike || {};

const mapSize = 30; //number of tiles (height and width are the same)
const minRoomsize = 3; //each room starts as a 3x3 square
const numRooms = 25; //higher numbers result in smaller more claustrophobic spaces
const floorChar = 'R'; //easier to change here when designing the 2d map array
const wallChar = 'w';
const numEnemies = 20; //more enemies = more challenge = more fun

const terminalNumber = 3;
const lootNumber = 5;

var titleStyle = {font: "24px Consolas", fill: "#fff"};
var gameOverStyle = {font: "48px Tesla", fill: "#fff"};
var mainTextStyle = {font: "14px Consolas", fill: "#fff", align: "left"};

var game;

var floorNumber;
var topFloor = 10;
var expThreshold;

var enemyRatios;

var gameOver;

//grouping map elements
var blockLayer;
var floorLayer;
var objLayer;

var hud;
var map;
var rooms; //array of rooms
var doors;

var playerName;
var player;
var actorList;
var actorPositions;
var terminalPositions;
var terminalList;
var lootPositions;
var lootList;

var enemiesKilled;
var creditsEarned;

var healCost;
var upgradeDmgCost;
var upgradeHpCost;

var music;
var heartbeat;

var cursors;

var unnecessaryChecks;

var title;

var enemyTurn = false; 

Roguelike.Game = function(){};

Roguelike.Game.prototype = {
	create: function(){

		game = this.game; //saves having to write this over and over
		
		//
		//game.time.advancedTiming = true;
		//game.forceSingleUpdate = true;

		floorNumber = 1;
		gameOver = false;

		//
		enemyRatios = [
			{e1: 1.0, e2: 0, e3: 0, buff: 0},
			{e1: 0.9, e2: 0.1, e3: 0, buff: 0.25},
			{e1: 0.8, e2: 0.2, e3: 0, buff: 0.50},
			{e1: 0.7, e2: 0.3, e3: 0, buff: 0.75},
			{e1: 0.6, e2: 0.4, e3: 0, buff: 1.00},
			{e1: 0.5, e2: 0.4, e3: 0.1, buff: 1.25},
			{e1: 0.4, e2: 0.5, e3: 0.2, buff: 1.50},
			{e1: 0.2, e2: 0.5, e3: 0.3, buff: 1.75},
			{e1: 0.1, e2: 0.5, e3: 0.4, buff: 2.0},
			{e1: 0.0, e2: 0.5, e3: 0.5, buff: 2.25}
			];

		setupFloor(floorNumber);

		//ideally would want equal empty space around map 
		//height is increased to account for HUD hiding button of game world
		this.game.world.resize(1920,2020);

		//for level change, the enemiesKilled should be persistant
		enemiesKilled = 0;

		//for level change, the creditsEarned should be persistant
		creditsEarned = 0;

		//for level change, the current values should be carried over
		expThreshold = 800;
		healCost = 50;
		upgradeDmgCost = 200;
		upgradeHpCost = 200;

		//initialise HUD
		hud = new HUD(this.game);
		hud.initHUD("I need to find a way to the top floor.");

		//setup input listeners
		cursors = this.game.input.keyboard.createCursorKeys();
		this.input.keyboard.addCallbacks(null, null, this.onKeyUp);
		this.input.onTap.add(this.onMouseTap, this);

		console.log("New Game Started");
		
		//add music and heartbeat
		music = this.game.add.audio('eCommerce', 0.2, true);
		heartbeat = this.game.add.audio('heartbeat', 0.3);
		music.play();
	},
	onKeyUp: function(event){

		let acted = false;
		let useTerminal = false;
		let useLootBox = false;
		let tX; //terminal
		let tY;
		let lX; //loot box
		let lY;

		//Check if a move in x direction is valid before attempting to move into a new tile/attack an enemy
		//if moving into a terminal or loot box tile, store the appropriate x and y values of new tile so the terminal/loot box can be looked up

		//player cannot move while using terminal, lootbox, help functionality, on enemy turn or when stunned
		if(!player.isStunned && !player.isUsingTerminal && !player.isUsingLoot && !player.isViewingHelp && !enemyTurn){ 
			switch(event.keyCode){
				case Phaser.Keyboard.LEFT:
					if(validMove(player.x, player.y-1, true)){
						acted = moveTo(player, 0, {x: 0, y: -1}); //returns true if successfully moved
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
					}
					else if(map[player.x][player.y-1] == Tile.TERMINAL){
						useTerminal = true; //stop player from moving
						tX = player.x;
						tY = player.y-1;
						player.ap-=1;
						acted = true;
					}
					else if(map[player.x][player.y-1] == Tile.LOOT){
						useLootBox = true; //stop player from moving
						lX = player.x;
						lY = player.y-1;
						acted = true;
					}
					break;
				case Phaser.Keyboard.UP:
					if(validMove(player.x-1, player.y, true)){
						acted = moveTo(player, 0, {x: -1, y: 0});
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
					}
					else if(map[player.x-1][player.y] == Tile.TERMINAL){
						useTerminal = true; //stop player from moving
						tX = player.x-1;
						tY = player.y;
						acted = true;
					}
					else if(map[player.x-1][player.y] == Tile.LOOT){
						useLootBox = true; //stop player from moving
						lX = player.x-1;
						lY = player.y;
						acted = true;
					}
					break;
				case Phaser.Keyboard.RIGHT:
					if(validMove(player.x, player.y+1, true)){
						acted = moveTo(player, 0, {x: 0, y: 1});
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
					}
					else if(map[player.x][player.y+1] == Tile.TERMINAL){
						useTerminal = true; //stop player from moving
						tX = player.x;
						tY = player.y+1;
						acted = true;
					}
					else if(map[player.x][player.y+1] == Tile.LOOT){
						useLootBox = true; //stop player from moving
						lX = player.x;
						lY = player.y+1;
						acted = true;
					}
					break;
				case Phaser.Keyboard.DOWN:
					if(validMove(player.x+1, player.y, true)){
						acted = moveTo(player, 0, {x: +1, y: 0});
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
					}
					else if(map[player.x+1][player.y] == Tile.TERMINAL){
						useTerminal = true; //stop player from moving
						tX = player.x+1;
						tY = player.y;
						acted = true;
					}
					else if(map[player.x+1][player.y] == Tile.LOOT){
						useLootBox = true; //stop player from moving
						lX = player.x+1;
						lY = player.y;
						acted = true;
					}
					break;
				case Phaser.Keyboard.M:
					//FOR DEBUGGING, ABLE TO PRINT MAP TO CONSOLE.
					//console.log(JSON.stringify(map));
					break;
				default: 
					break;
			}
		}

		//players can be stunned by the 2nd enemy type only
		//cannot move but can stand back up, losing an AP
		if(player.isStunned){
			//plays the player death sprite backwards
			player.sprite.animations.add('getUp', [5, 4, 3, 2, 1, 0], 18, false);
			player.sprite.animations.play('getUp').onComplete.add(function(){
				//switch the sprite back to the normal sprite and re-add its animations
				player.sprite.kill();
		    	player.sprite = game.add.sprite(player.y*64, player.x*64, 'player', 19); 
				player.sprite.animations.add('walkLeft', [9, 10, 11, 12, 13, 14, 15, 16, 17], 18, false);
				player.sprite.animations.add('walkUp', [0, 1, 2, 3, 4, 5, 6, 7, 8], 18, false);
				player.sprite.animations.add('walkRight', [27, 28, 29, 30, 31, 32, 33, 34, 35], 18, false);
				player.sprite.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 24, 25, 26], 18, false);
				player.sprite.anchor.y = 0.3;
				game.camera.follow(player.sprite);
			},this);
			player.isStunned = false;
			acted=true;
		}

		//find which terminal they are using and display its options, stop the player from moving
		if(useTerminal){
			//console.log("using terminal");
			let terminalIndex = terminalPositions.indexOf(tY + "_" + tX); //lookup terminal from list
			let terminal = terminalList[terminalIndex];
			terminal.displayTerminal(); //displays terminal screen
			hud.updateReadout("I should be able to hack this terminal.");
		}
		//find which terminal they are using and display its contents, stop the player from moving
		else if(useLootBox){
			//console.log("opening loot box");
			let lootIndex = lootPositions.indexOf(lY + "_" + lX); //lookup loot box from list
			let lootBox = lootList[lootIndex];
			lootBox.displayLoot();
			let openContainer = game.add.audio('openContainer', 0.5); // add and play sound
			openContainer.play();
			hud.updateReadout("Maybe there is something I can use in here..");
		}

		//if the player has acted (moved, attacked, used an object), they lose an AP
		if(acted){
			player.ap -= 1;
			hud.updateAP();
		}

		//If player has used all available AP, time for enemies to take their turns
		if(Math.floor(player.ap) <= 0){
			enemyTurn = true; //prevents player movement
			for(let i = 1; i < actorList.length; i++){
				let e = actorList[i];
				if(e.isAlive){
					while(e.ap > 0){
						aiAct(e, i);
						e.ap--; //like player, enemies have AP that is expended upon taking an action
					}
					e.ap = e.maxAP;
				}
			}
			//if the player has an APUP augmentation, there is a chance they will get an extra AP this turn
			let aug = player.augmentations.find(function(a){return a.type == Aug.APUP;});
			let extraAP = false;
			//if player has aug
			if(aug !== undefined){
				let chanceToGainAP = 100*(aug.effectVal*aug.level);
				let diceRoll = Math.ceil(Math.random() * 100);
				if(diceRoll <= chanceToGainAP){ //if rolled under the chance %, gain an AP
					player.ap = player.maxAP+1;
					extraAP = true;
					hud.updateReadout("I have gained the initiative.");
					let APupSound = game.add.audio('APup', 0.05).play(); //player sound to let player know
				}
			}

			//if no APUP triggered, refill AP as normal
			if(!extraAP){
				player.ap = player.maxAP;
			}
			
			hud.updateAP();
			//update HUD
			enemyTurn = false; //player's turn again
		}
	},
	onMouseTap: function(){
		//gets the location of the mouse pointer
		let tileY = Math.floor(Roguelike.game.input.activePointer.worldX/64);
		let tileX = Math.floor(Roguelike.game.input.activePointer.worldY/64);

		let dX = tileX - player.x;
		let dY = tileY - player.y;

		//if abs DX+DY == 2
		//call keyboard control handler twice
		//possible directions: 4 diagonals, left twice, up twice, right twice, down twice
		//lose 1 ap per move

		//if ap > 0 try move
		//calls the keyboard handler as the movement logic is already there
		if(Math.floor(player.ap) > 0){
			if(dX == -1 && dY === 0){ //move up
				this.onKeyUp({keyCode: Phaser.Keyboard.UP});
			}
			else if (dX == -2 && dY === 0){
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.UP});
					this.onKeyUp({keyCode: Phaser.Keyboard.UP});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.UP});
				}
			} 
			else if(dX == 1 && dY === 0){ //move down
				this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
			}
			else if(dX == 2 && dY === 0){ //double move up
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
					this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.DOWN});
				}
			}
			else if(dX === 0 && dY == 1){ //move right
				this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
			}
			else if(dX === 0 && dY == 2){ 	//double move right
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
					this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.RIGHT});
				}
			}	
			else if(dX === 0 && dY == -1){ //move left
				this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
			}
			else if(dX === 0 && dY == -2){
				if(player.ap >= 2){
					this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
					this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
				}
				else{
					this.onKeyUp({keyCode: Phaser.Keyboard.LEFT});
				}
			}
		}	
	},
	update: function(){
		//check if gameover is true, then play/don't player heartbeat audio depending on situation
		if(!gameOver){
			//heartbeat audio is played when the player is at low health to add tension
			if(player.hp <= player.maxHP*0.2){
				if(!heartbeat.isPlaying){
					heartbeat.play();
				}
			}
			else{
				if(heartbeat.isPlaying){
					heartbeat.stop();
				}
			}
		}
		else if(gameOver && heartbeat.isPlaying){
			//don't want heartbeat to be playing while player is looking at gameover screen
			heartbeat.stop();
		}
	}
};

/*
	Add loot boxes to the level that contain credits and augmentations.
*/
function placeLoot(){

	console.log("placing loot");

	let ranPos;

	lootPositions = [];
	lootList = [];

	let a; //aug
	let c; //credits

	for(let l = 0; l < lootNumber; l++){
		//console.log("Finding space for lootbox.");
		ranPos = getRandomCoords(rooms, false, true); //find a valid random spot to put the loot box
		//calculate a random number of credits
		c = Math.ceil(Math.random() * (150+(150 * Math.floor(floorNumber/2))));
		if(l < 2){
			a = null; //3 of the loot boxes contain augs, 2 don't
			c += 50 * floorNumber;
		}
		else{
			//pick randomly from one of the three aug types
			let ranAug = Math.floor(Math.random() * 3);
			if(ranAug == 0){
				a = new Augmentation(Aug.VAMP, 1, 0.05)
			}
			else if(ranAug == 1){
				a = new Augmentation(Aug.DEF, 1, 0.05);
			}
			else if(ranAug == 2){
				a = new Augmentation(Aug.APUP, 1, 0.05);			
			}
		}
		//a is either null or an augmentation
		let loot = new LootBox(a, c, ranPos.y, ranPos.x);
		map[ranPos.y][ranPos.x] = Tile.LOOT;
		lootPositions.push(ranPos.x + '_' + ranPos.y); 
		lootList.push(loot);
	}
}

/*
	Lootbox object contains augs/credits that the player can pickup.

*/
function LootBox(aug, credits, x, y){
	this.sprite = game.add.sprite(y*64, x*64, 'safeTile'); 
	this.aug = aug;
	this.credits = credits;
	this.augText = "";
	this.creditText = "";
	this.textGroup = null;
}

LootBox.prototype = {
	displayLoot: function(){
		player.isUsingLoot = true; //stops player from moving

		if(this.textGroup != null){
			this.textGroup.destroy();
		}
		if(this.graphics != null){
			this.graphics.destroy();
		}

		this.graphics = game.add.graphics(0, 0);

		this.graphics.beginFill(0x222222);
	   	this.graphics.lineStyle(1, 0x444444, 3);
	   	let lootBackground = this.graphics.drawRect(game.width/3, 150, game.width/3, game.height/2);
	   	lootBackground.fixedToCamera = true;
	   	this.graphics.endFill();
		
	   	let openText = "The safe has been unlocked. It contains:";

	    this.textGroup = game.add.group();

	   	openText = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2-100), openText, { font: "15px Consolas", fill: "#fff" }, this.textGroup);
	   	openText.fixedToCamera = true;
	   	openText.anchor.x = 0.5;

   		let lootStyle = { font: "15px Consolas", fill: "#19de65" }

   		if(this.aug != null){
   			//generate strings from the aug that is in the loot box

   			let thisAugType = this.aug.type;
   			let foundAug = player.augmentations.find(function(a){return a.type == thisAugType;});
	   		let existingString = "";
	   		let existingAug = false;

	   		if(foundAug){
	   			//if player already has one of this aug, upgrade it instead
	   			existingString = "  (+1 aug level)";
	   			existingAug = true;
	   		}

	   		//player can click on text option to pickup augmentation
			this.augText = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2-50), this.aug.type + existingString, lootStyle, this.textGroup);
			this.augText.fixedToCamera = true;
			this.augText.inputEnabled = true;
			this.augText.anchor.x = 0.5;
			if(existingAug){
				this.augText.events.onInputDown.add(this.upgradeAug, this);
			}
			else{
				this.augText.events.onInputDown.add(this.takeAug, this);
			}
			this.augText.events.onInputOver.add(this.overOption, this);
			this.augText.events.onInputOut.add(this.outOption, this);
		}

		if(this.credits != null){
			this.creditText = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2), "Credits: " + this.credits, lootStyle, this.textGroup);
			this.creditText.fixedToCamera = true;
			this.creditText.inputEnabled = true;
			this.creditText.anchor.x = 0.5;
			this.creditText.events.onInputDown.add(this.takeCredits, this);
			this.creditText.events.onInputOver.add(this.overOption, this);
			this.creditText.events.onInputOut.add(this.outOption, this);
		}
	
		//destroy text and rectangle when closing loot box window
		let closeText = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2+50), "Close box", { font: "15px Consolas", fill: "#ffffff" }, this.textGroup);
		closeText.fixedToCamera = true;
		closeText.inputEnabled = true;
		closeText.anchor.x = 0.5;
		closeText.events.onInputUp.add(function(){ 
			this.textGroup.destroy(); 
			this.graphics.destroy(); 
			player.isUsingLoot = false; 
		}, this);
		closeText.events.onInputOver.add(this.overOption, this);
		closeText.events.onInputOut.add(function(){this.fill = "#fff";}, this);
	},
	overOption: function(item){
		item.fill = "#FF0000";	//toggle colour
	},
	outOption: function(item){
		item.fill = "#19de65";	//toggle colour
	},
	takeCredits : function(){
		//update player credits and the HUD
		player.credits += this.credits;
		creditsEarned += this.credits;
		hud.updateReadout("I found " + this.credits + " credits.");
		hud.updateCredits();
		this.credits = null;
		this.displayLoot(); //refresh loot box contents
	},
	takeAug : function(){
		//add aug to players aug list
		player.augmentations.push(this.aug);
		hud.updateReadout("I found a new augmentation, this should help.");
		hud.updateAugs();
		this.aug = null;
		this.displayLoot(); //refresh loot box
	},
	upgradeAug : function(){
		//increase the level of existing aug
		let thisAugType = this.aug.type;
		let existingAug = player.augmentations.find(function(a){return a.type == thisAugType;});
		existingAug.level += 1;
		hud.updateReadout("My augmentation became more powerful.");
		hud.updateAugs();
		this.aug = null;
		this.displayLoot(); //refresh loot box
	}
};

/*
	Simple enums for the 3 types of augs.
*/
var Aug = {
	VAMP: "Vampiric Siphoning",
	DEF: "Defensive Matrix",
	APUP: "Mobility Enhancer"
};

/*
	Very basic object type that acts as aug object. Has a type (Aug.TYPE) enum, a level and a strength.
*/
function Augmentation(type, level, effectVal){
 	this.type = type; //enum
 	this.level = level;
 	this.effectVal = effectVal;
}

/*
	Makes calls to functions to create the 2D map array, then fills the map with objects and draws it.
*/
function setupFloor(fn, p){
	floorNumber = fn;
	healCost = 50+50*Math.floor(0.5*floorNumber);

	initMap(); //creates valid map with 3x3 rooms
	expandRandomRooms(); //also populates room adjacency lists
	randomlyConnectAdjacentRooms(); //use room adjency list to add doors connecting the rooms
	if(fn < topFloor){
		placeExit();
	}
	drawFloor();
	placeTerminals();
	placeLoot(); //contain loot, credits or traps
	//placeFurniture(); blocks pathing, adds interest
	initActors(p);
	if(fn > 1){
		hud.initHUD("A new floor.");
	}

	//debugging
	//actorList.forEach(function(i){ console.log("x:", i.x, "y:", i.y); });
	//actorPositions.forEach(function(i){ console.log(i); });
	//console.log(actorPositions);
	//console.log(JSON.stringify(map));
}

/*
	Places an exit tile on the perimeter wall, ensuring it can be reached by the player.
*/
function placeExit(){

	let ranWall;
	let exitY;
	let exitX;

	let validExitSpotFound = false;

	while(!validExitSpotFound){
		ranWall = Math.floor(Math.random()*4); //picks randomly from wall's sides

		switch(ranWall){
			case 0: 
				//left wall
				exitY = 0;
				exitX = Math.floor(Math.random()*mapSize);
				if(map[exitY+1][exitX] == Tile.FLOOR){ //check that accessible by player
					validExitSpotFound = true;
				}
				break;
			case 1:
				//top wall
				exitY = Math.floor(Math.random()*mapSize);
				exitX = 0;
				if(map[exitY][exitX+1] == Tile.FLOOR){ //check that accessible by player
					validExitSpotFound = true;
				}
				break;
			case 2:
				//right wall
				exitY = mapSize-1;
				exitX = Math.floor(Math.random()*mapSize); 
				if(map[exitY-1][exitX] == Tile.FLOOR){ //check that accessible by player
					validExitSpotFound = true;
				}
				break;
			case 3:
				//bot wall
				exitY = Math.floor(Math.random()*mapSize);
				exitX = mapSize-1;
				if(map[exitY][exitX-1] == Tile.FLOOR){ //check that accessible by player
					validExitSpotFound = true;
				}
				break;
			default:
				break;
		}

	}

	//once a valid exit placement has been found, set that position in the map to be the exit
	map[exitY][exitX] = Tile.EXIT;
}

/*
	Places terminals throughout the current floor, with rules for where they can be placed
*/
function placeTerminals(){

	let ranPos;

	terminalPositions = [];
	terminalList = [];

	for(let t = 0; t < terminalNumber; t++){
		ranPos = getRandomCoords(rooms, false, true); //try random coordinates, must not block player/exits/doors
		let options = ["Heal", "Upgrade Damage", "Upgrade HP", "Log Off"];
		let terminal = new Terminal(options, ranPos.y, ranPos.x, false);
		map[ranPos.y][ranPos.x] = Tile.TERMINAL;
		terminalPositions.push(ranPos.x + '_' + ranPos.y); 
		terminalList.push(terminal);
	}

	//if player has reached the top floor, add a special terminal that is the victory condition
	if(floorNumber == topFloor){
		ranPos = getRandomCoords(rooms, false, true);

		//for quicker debugging
		//ranPos.x = 3;
		//ranPos.y = 3;

		let options = ["UPLOAD VIRUS", "Log Off"]; //different options
		let terminal = new Terminal(options, ranPos.y, ranPos.x, true);
		map[ranPos.y][ranPos.x] = Tile.TERMINAL;
		terminalPositions.push(ranPos.x + '_' + ranPos.y); 
		terminalList.push(terminal);
	}
}

/*
	Iterates through each element in the 2D map array and creates sprites for each tile.
*/
function drawFloor(){
	//looks through map, creates sprites for all elements (exit, terminals, doors, walls, floor)

	blockLayer = game.add.group();
	floorLayer = game.add.group();
	objLayer = game.add.group()

	//layers not utilised to full potential, just for simple grouping.
	//for loop simple generates sprites for each element in the 2D map, with reversed x and y coords

	for(let x = 0 ; x < mapSize; x++){
		for(let y = 0; y< mapSize; y++){
			if(map[x][y] == Tile.FLOOR){
				let floor = floorLayer.create(y*64, x*64, 'floorTile'); //x and y * 64 to account for tile sizes
			}
			else if(map[x][y] == Tile.WALL){
				let wall = blockLayer.create(y*64, x*64, 'wallTile');
			}
			else if(map[x][y] == Tile.DOOR){
				let floor = floorLayer.create(y*64, x*64, 'floorTile');
			}
			else if(map[x][y] == Tile.EXIT){
				let exit = objLayer.create(y*64, x*64, 'exitTile');
			}

		}
	}
	//console.log(JSON.stringify(map));
}

/*
	Creates the player and enemy characters, with rules dictating placement.
*/
function initActors(p){

	actorPositions = [];
	actorList = [];

	let ranPos = getRandomCoords(rooms, true, false); //get valid starting spot for player

	//for quicker debugging
	//ranPos.x = 2;
	//ranPos.y = 2;

	if(p == undefined){ //game is just starting (ie player not changed floor)
		playerName = localStorage.getItem("playerName"); //get name from cache
		player = new Player(game, playerName, ranPos.y, ranPos.x, 100);
	}
	else{
		p.ap = p.maxAP;
		player.x = ranPos.y;	//x and y of game world are reverse of 2D map indexes
		player.y = ranPos.x;
		player.sprite.kill(); //player already exists but on a new floor, so kill old sprite and give new one
		player.sprite = game.add.sprite(player.y*64, player.x*64, 'player', 19); 
	}


	//add animations to player
	player.sprite.animations.add('walkLeft', [9, 10, 11, 12, 13, 14, 15, 16, 17], 18, false);
	player.sprite.animations.add('walkUp', [0, 1, 2, 3, 4, 5, 6, 7, 8], 18, false);
	player.sprite.animations.add('walkRight', [27, 28, 29, 30, 31, 32, 33, 34, 35], 18, false);
	player.sprite.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 24, 25, 26], 18, false);
	player.sprite.anchor.y = 0.3 ;

	actorPositions.push(ranPos.y + '_' + ranPos.x); 
	actorList.push(player);

	game.camera.follow(player.sprite);

	let awayFromPlayer; //boolean to indicate if trying to place enemy too close to player
	let distX;
	let distY;


	for(let e = 0; e < numEnemies; e++){
		awayFromPlayer = false;
		distX = 0;
		distY = 0;
		while(!awayFromPlayer){
			//enemies not placed if too close to player
			ranPos = getRandomCoords(rooms, true, false);
			distX = Math.abs(player.y - ranPos.x);
			distY = Math.abs(player.x - ranPos.y);
			if(distX >= 3 || distY >= 3){
				awayFromPlayer = true;
			}
		}
		let enemy;
		let ratio = enemyRatios[floorNumber - 1];

		//change dmg and hp based on floorNumber
		//change proportion of better tougher enemy types
		if(e < numEnemies*ratio.e1){
			enemy = new Enemy(game, ranPos.y, ranPos.x, 50+(50*ratio.buff), 1, 20+(30*ratio.buff), 'armor1', 1);
		}
		else if(e < numEnemies*ratio.e1 + numEnemies*ratio.e2){
			enemy = new Enemy(game, ranPos.y, ranPos.x, 50+(45*ratio.buff), 1, 25+(35*ratio.buff),'armor2', 2);
		}
		else if(e < numEnemies*ratio.e1 + numEnemies*ratio.e2 + numEnemies*ratio.e3){
			enemy = new Enemy(game, ranPos.y, ranPos.x, 65+(65*ratio.buff), 2, 20+(20*ratio.buff), 'agent', 3);
		}
		
		actorList.push(enemy);
		actorPositions.push(ranPos.y + '_' + ranPos.x);

		//add animations for enemies
		enemy.sprite.animations.add('walkLeft', [9, 10, 11, 12, 13, 14, 15, 16, 17], 60, false);
		enemy.sprite.animations.add('walkUp', [0, 1, 2, 3, 4, 5, 6, 7, 8], 60, false);
		enemy.sprite.animations.add('walkRight', [27, 28, 29, 30, 31, 32, 33, 34, 35], 60, false);
		enemy.sprite.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 24, 25, 26], 60, false);
		enemy.sprite.anchor.y = 0.3 ;
	}
}

/*
	HUD objects contains the text and graphic assets that are used to display player stats etc.
*/
function HUD(game){
	this.game = game;
	this.hudReadout = [];
	this.leftOffset;
	this.leftOffset2;
	this.readout0;
	this.readout1;
	this.readout2;
	this.readout3;
	this.hudNameText;
	this.hudNameVal;
	this.hudLevelText;
	this.hudLevelVal;
	this.hudExpText;
	this.hudExpVal;
	this.hudExpBar;
	this.hudHpText;
	this.hudHpValue;
	this.hudCurrentHpBar;
	this.hudMaxHpBar;
	this.hudApText;
	this.hudApBar;
	this.hudCredits;
	this.hudFloor;
	this.hudAugText;
	this.hudAugList;
	this.hudAugTextGroup;
	this.hudHelpButton;
	this.hudHelpText;
	this.helpBackground;
	this.helpTextGroup;
	this.closeHelpText;
};

HUD.prototype = {
	initHUD: function(message){

		//offsets used to position elements
		this.leftOffset = this.game.width/2-150;
		this.leftOffset2 = this.game.width/2+100;
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0x222222);
	   	graphics.lineStyle(1, 0x444444, 1);
	   	let hudBackground = graphics.drawRect(-1, this.game.height-100, this.game.width+1, 100);
	   	hudBackground.fixedToCamera = true;
	   	graphics.endFill();

	   	//each HUD element can be updated individually
	   	this.updateReadout(message);
	   	this.updateName();
	   	this.updateLevel();
	   	this.updateEXP();
	   	this.updateHP();
	   	this.updateAP();
	   	this.updateDMG();
	   	this.updateCredits();
	   	this.updateFloor();
	   	this.updateAugs();
	   	this.addHelp();
	},
	updateName(){
		//need to destroy existing text to avoid overlaying multiple times
		if(this.hudNameText != null){
			this.hudNameText.destroy();
			this.hudNameVal.destroy();
		}

		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		this.hudNameVal = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-90), "Name: " + player.name, style);
		this.hudNameVal.fixedToCamera = true;
	},
	updateLevel(){
		//need to destroy existing text to avoid overlaying multiple times
		if(this.hudLevelText != null){
			this.hudLevelText.destroy();
			this.hudLevelVal.destroy();
		}

		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		this.hudLevelText = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-72), "Level: ", style);
		this.hudLevelText.fixedToCamera = true;

		this.hudLevelVal = this.game.add.text(Math.floor(this.leftOffset+55), Math.floor(this.game.height-72), player.lvl, style);
		this.hudLevelVal.fixedToCamera = true;

	},
	updateEXP(){
		//need to destroy existing text to avoid overlaying multiple times
		if(this.hudExpText != null){
			this.hudExpText.destroy();
			this.hudExpValue.destroy();
			this.hudExpBar.destroy();
		}

		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		this.hudExpText = this.game.add.text(Math.floor(this.leftOffset2), Math.floor(this.game.height-54), "EXP: ", style);
		this.hudExpText.fixedToCamera = true;

		//draw bar to show progress to next level
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0xAA00AA);
	   	this.hudExpBar = graphics.drawRect(this.leftOffset2+35, this.game.height-52, (player.exp/expThreshold*100), 12);
	   	this.hudExpBar.fixedToCamera = true;
	   	graphics.endFill();

		this.hudExpValue = this.game.add.text(Math.floor(this.leftOffset2+36), Math.floor(this.game.height-54), player.exp + "/" + expThreshold, style);
		this.hudExpValue.fixedToCamera = true;
	},
	updateReadout: function(message){
		//if a new message is received and to be displayed, need to update the readouts array

		if(message != null){
			if(this.hudReadout.length < 4){
				this.hudReadout.unshift(message);
			}
			else{
				//remove oldest readout, add newest 
				this.hudReadout.pop();
				this.hudReadout.unshift(message);
			}
		}

		var style = {font: "15px Consolas", fill: "#ffffff", align: "left"};
	
		let readoutY = this.game.height-81;
		let r;

		//destroy existing text to avoid overlaying
		if(this.readout0 != null){
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

		//update readout vals of HUD and display them
		for(let m = 0; m < this.hudReadout.length; m++){
			if(m == 0){
				this.readout0 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout0.fixedToCamera = true;
			}
			else if(m == 1){
				this.readout1 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout1.fixedToCamera = true;
			}
			else if(m == 2){
				this.readout2 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout2.fixedToCamera = true;
			} 
			else if(m == 3){
				this.readout3 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout3.fixedToCamera = true;
			} 
			readoutY += 18;
		}
	},
	updateHP: function(){

		//destroy to avoid overlaying
		if(this.hudHpText != null){
			this.hudHpText.destroy();
			this.hudHpValue.destroy();
		}

		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		this.hudHpText = this.game.add.text(Math.floor(this.leftOffset2), Math.floor(this.game.height-90), "HP: ", style);
		this.hudHpText.fixedToCamera = true;

		if(this.hudHpBar != null){
			this.hudHpBar.destroy();
		}

		//add bar showing health compared to max health
		//length of bars are proportionate to value of health
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0xFF0000);
	   	this.hudCurrentHpBar = graphics.drawRect(Math.floor(this.leftOffset2+35), Math.floor(this.game.height-88), player.hp, 12);
	   	this.hudCurrentHpBar.fixedToCamera = true;
		graphics.beginFill(0xAA0000);

		this.hudMaxHpBar = graphics.drawRect(Math.floor(this.leftOffset2+35+player.hp), Math.floor(this.game.height-88), player.maxHP - player.hp, 12);
	   	this.hudMaxHpBar.fixedToCamera = true;
	   	graphics.endFill();

	   	this.hudHpValue = this.game.add.text(Math.floor(this.leftOffset2+36), Math.floor(this.game.height-90), Math.ceil(player.hp) + "/" + player.maxHP, style);
		this.hudHpValue.fixedToCamera = true;
	},
	updateAP: function(){
		//to avoid overlaying graphics
		if(this.hudApText != null){
			this.hudApText.destroy();
		}

		var style = {font: "15px Consolas", fill: "#fff", align: "left"};
		this.hudApText = this.game.add.text(Math.floor(this.leftOffset2), Math.floor(this.game.height-72), "AP: ", style);

		this.hudApText.fixedToCamera = true;

		if(this.hudApBar != null){
			this.hudApBar.destroy();
		}

		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xFF9900);

		let x = this.leftOffset2+35;

		//number of AP bars shown == number of player AP
		for(let a = 0; a < player.ap; a++){
			this.hudApBar = graphics.drawRect(x, this.game.height-70, 20, 12);
			x += 25;
		}
	 	
	   	this.hudApBar.fixedToCamera = true;
	   	graphics.endFill();
		
	},
	updateDMG: function(){
		//avoid overlaying
		if(this.hudDmgText != null){
			this.hudDmgText.destroy();
		}

		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		this.hudDmgText = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-54), "Damage: " + player.dmg, style);
		this.hudDmgText.fixedToCamera = true;
	},
	updateCredits: function(){
		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		//avoid overlaying
		if(this.hudCredits != null){
			this.hudCredits.destroy();
		}

		this.hudCredits = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-18), "Credits: " + player.credits, style);
		this.hudCredits.fixedToCamera = true;
	},
	updateFloor: function(){
		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		//avoid overlaying
		if(this.hudFloor != null){
			this.hudFloor.destroy();
		}

		this.hudFloor = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-36), "Floor: " + floorNumber + " of " + topFloor, style);
		this.hudFloor.fixedToCamera = true;
	},
	updateAugs: function(){

		//avoid overlaying
		if(this.hudAugTextGroup != null){
			this.hudAugTextGroup.destroy();
		}

		if(this.hudAugList != undefined){
			this.hudAugList.splice(0, this.hudAugList.length);
		}
		else{
			this.hudAugList = [];
		}

		for(let i = 0; i < player.augmentations.length; i++){
			//should not be any duplicates
			this.hudAugList.push({type: player.augmentations[i].type, level: player.augmentations[i].level});
		}
		
		var style = {font: "15px Consolas", fill: "#fff", align: "left"};

		if(this.hudAugText != null){
			this.hudAugText.destroy();

		}
		this.hudAugText = game.add.text(Math.floor(game.width-300), Math.floor(game.height-90), "Augmentations:", style);
		this.hudAugText.fixedToCamera = true;
	
		if(this.augTextGroup != null){
			this.augTextGroup.destroy();
		}

		this.augTextGroup = game.add.group();
		
		let augY = game.height-72;

		//strings for outputting to HUD
		let a;
		let augEffect;
		let typeString;
		
		for(let i = 0; i < player.augmentations.length; i++){
			let a = player.augmentations[i];

			//string values depend on type of Aug
			if(a.type == Aug.VAMP){
				typeString = "Vampiric";
				augEffect = "(" + ((a.level * a.effectVal)*100).toFixed(0)	+ "%)";
			}
			else if(a.type == Aug.DEF){
				typeString = "Defence";
				augEffect = "(" + ((a.level * a.effectVal)*100).toFixed(0)	+ "% dodge)";
			}
			else if(a.type == Aug.APUP){
				typeString = "Mobility";
				augEffect = "(" + ((a.level * a.effectVal)*100).toFixed(0)	+ "% +1 AP)";
			}
			
			let aText = this.game.add.text(Math.floor(game.width-300), Math.floor(augY), "lv." + a.level + " " + typeString + " " + augEffect, style, this.augTextGroup);
			aText.fixedToCamera = true;

			augY += 18;
		}
	},
	addHelp: function(){
		//avoid overlay
		if(this.hudHelpButton != null){
			this.hudHelpButton.destroy();
			this.hudHelpText.destroy();
		}

		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0x222222);
	   	graphics.lineStyle(1, 0x444444, 1);
	   	this.hudHelpButton = graphics.drawRect(15, 15, 30, 30);
	   	this.hudHelpButton.fixedToCamera = true;;
	   	
	   	graphics.endFill();

	   	//prevent from opening help more than once
	   	if(player.isViewingHelp){
	    	this.hudHelpButton.inputEnabled = false;
	    	//console.log("player IS viewing help");
	    } 
	    else{
	    	this.hudHelpButton.inputEnabled = true;
	    	//console.log("player NOT viewing help");
	    }

	    //add input handlers to show help screen
	   	this.hudHelpButton.events.onInputUp.add(this.showHelp, this);
	   	this.hudHelpButton.events.onInputOver.add(function(){ this.hudHelpText.fill = "#ff0000";}, this);
	    this.hudHelpButton.events.onInputOut.add(function(){ this.hudHelpText.fill = "#fff";}, this);

	   	let style = {font: "24px Consolas", fill: "#fff", align: "left"};
	   	this.hudHelpText = this.game.add.text(Math.floor(22), Math.floor(19), "?", style);
	   	this.hudHelpText.fixedToCamera = true;
	   	
	},
	showHelp: function(){
		this.hudHelpButton.inputEnabled = false;
		this.hudHelpText.fill = "#fff";
		player.isViewingHelp = true;

		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0x222222);
	   	graphics.lineStyle(1, 0x444444, 1);
	    this.helpBackground = graphics.drawRect(this.game.width/5, this.game.height/5, 850, 500);
	   	this.helpBackground.fixedToCamera = true;
	   	graphics.endFill();

		this.helpTextGroup = this.game.add.group();

		let helpTitle = this.game.add.text(Math.floor(this.game.width/2), Math.floor(this.game.height/4), "Help", titleStyle, this.helpTextGroup);
	   	helpTitle.fixedToCamera = true;

	   	let leftHelpOffset = this.game.width/4+10;

	   	//display text for different sections
	  	
	  	//CONTROLS
	  	let controlsTitleTopOffset = this.game.height/4+50;
		let controlsTitle = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(controlsTitleTopOffset), "Controls", titleStyle, this.helpTextGroup);
	   	controlsTitle.fixedToCamera = true;
	   	let controls1 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(controlsTitleTopOffset+30), "Arrows keys: player movement/use object/attack enemy", mainTextStyle, this.helpTextGroup);
	   	controls1.fixedToCamera = true;
	   	let controls2 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(controlsTitleTopOffset+50), "Left mouse button: player movement/use object/attack enemy", mainTextStyle, this.helpTextGroup);
	   	controls2.fixedToCamera = true;

	   	//HUD
	   	let hudExplanationTitleTopOffset = this.game.height/4+150;
	   	let hudExplanationTitle = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudExplanationTitleTopOffset), "HUD explanation", titleStyle, this.helpTextGroup);
	   	hudExplanationTitle.fixedToCamera = true;
	   	
	   	//health bar
	   	graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xFF0000);
	   	let helpHPbar = graphics.drawRect(leftHelpOffset, hudExplanationTitleTopOffset+30, 80, 10);
	   	helpHPbar.fixedToCamera = true;
		graphics.beginFill(0xAA0000);
		let helpMaxHPbar = graphics.drawRect(leftHelpOffset+80, hudExplanationTitleTopOffset+30, 20, 10);
	   	helpMaxHPbar.fixedToCamera = true;
	   	graphics.endFill();
	   	let helpHpValue = this.game.add.text(Math.floor(leftHelpOffset+5), Math.floor(hudExplanationTitleTopOffset+28), 80 + "/" + 100, mainTextStyle);
		helpHpValue.fixedToCamera = true;
		let helpHpExplanation = this.game.add.text(Math.floor(leftHelpOffset+110), Math.floor(hudExplanationTitleTopOffset+28), "Shows your current health and maximum health.", mainTextStyle, this.helpTextGroup);
		helpHpExplanation.fixedToCamera = true;

		//ap bar
		graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xFF9900);
		let helpApBar1 = graphics.drawRect(leftHelpOffset, hudExplanationTitleTopOffset+48, 20, 10);
		helpApBar1.fixedToCamera = true;
        let helpApBar2 = graphics.drawRect(leftHelpOffset+25, hudExplanationTitleTopOffset+48, 20, 10);
        helpApBar2.fixedToCamera = true;
        graphics.endFill();
        let helpApExplanation = this.game.add.text(Math.floor(leftHelpOffset+110), Math.floor(hudExplanationTitleTopOffset+46), "Shows your remaining actions this turn.", mainTextStyle, this.helpTextGroup);
		helpApExplanation.fixedToCamera = true;

		//experience bar
		graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xAA00AA);
	    let helpExpBar = graphics.drawRect(leftHelpOffset, hudExplanationTitleTopOffset+68, (500/1600)*100, 10);
	   	helpExpBar.fixedToCamera = true;
	   	graphics.endFill();
		let helpExpValue = this.game.add.text(Math.floor(leftHelpOffset+5), Math.floor(hudExplanationTitleTopOffset+66), 500 + "/" + 1600, mainTextStyle);
		helpExpValue.fixedToCamera = true;
		let helpExpExplanation = this.game.add.text(Math.floor(leftHelpOffset+110), Math.floor(hudExplanationTitleTopOffset+66), "Shows your current experience and how close you are to levelling up.", mainTextStyle, this.helpTextGroup);
		helpExpExplanation.fixedToCamera = true;

		//HOW TO PLAY
		let hudPlayTitleTopOffset = this.game.height/4+250;
	   	let howToPlayTitle = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudPlayTitleTopOffset), "How to play", titleStyle, this.helpTextGroup);
	   	howToPlayTitle.fixedToCamera = true;
	   	let how1 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudPlayTitleTopOffset+30), "Moving/using objects/attacking enemies costs at least one action point (AP).", mainTextStyle, this.helpTextGroup);
	   	how1.fixedToCamera = true;
	   	let how2 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudPlayTitleTopOffset+50), "Once you have used your actions, your turn ends and your enemies may act.", mainTextStyle, this.helpTextGroup);
	   	how2.fixedToCamera = true;
	   	let how3 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudPlayTitleTopOffset+70), "Credits gained from loot boxes and defeating enemies can be spent at computer terminals.", mainTextStyle, this.helpTextGroup);
	   	how3.fixedToCamera = true;
	   	let how4 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudPlayTitleTopOffset+90), "Your objective is to find the exit on each floor, working your way to the final floor.", mainTextStyle, this.helpTextGroup);
	   	how4.fixedToCamera = true;
	   	let how5 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudPlayTitleTopOffset+110), "Upon reaching the final floor you will need to access the main terminal.", mainTextStyle, this.helpTextGroup);
	   	how5.fixedToCamera = true;
	   	let how6 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(hudPlayTitleTopOffset+130), "Each level is more difficult than the last, so level up, upgrade and find augmentations.", mainTextStyle, this.helpTextGroup);
	   	how6.fixedToCamera = true;

	   	//clicking close button destroys all existing text and images
		this.closeHelpText = this.game.add.text(Math.floor(this.game.width*0.70), Math.floor(this.game.height/4), "x", titleStyle);
		this.closeHelpText.inputEnabled = true;
	   	this.closeHelpText.events.onInputUp.add(function(){
	   		this.helpBackground.destroy();
	   		this.closeHelpText.destroy();
	   		this.helpTextGroup.destroy();
	   		console.log("closehelpclicked");
	   		helpHPbar.destroy();
	   		helpMaxHPbar.destroy();
	   		helpHpValue.destroy();
	   		helpApBar1.destroy();
	   		helpApBar2.destroy();
	   		helpExpBar.destroy();
	   		helpExpValue.destroy();
	   		this.hudHelpButton.inputEnabled = true; //can now reopen if desired
	   		player.isViewingHelp = false; 
	   	}, this);
	   	this.closeHelpText.fixedToCamera = true;
	    this.closeHelpText.events.onInputOver.add(function(item){ item.fill = "#ff0000";}, this);
	    this.closeHelpText.events.onInputOut.add(function(item){ item.fill = "#fff";}, this);
	}
};

/*
	After player has taken their turn, it is time for the enemies to decide what action to take.
*/
function aiAct(e, index){

	//determines distance from player
	let dx = e.x - player.x;
	let dy = e.y - player.y;

	//depending on distance (and enemy type), become alert or stay/go back to wandering aimlessly
	if(!e.alerted && Math.abs(dx) + Math.abs(dy) < 3+e.type)
	{
		e.alerted = true;
	}
	else if(e.alerted && Math.abs(dx) + Math.abs(dy) > 4+e.type)
	{
		e.alerted = false;
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
			if(dy > 0){ //player to left
				if(validMove(e.x, e.y - 1, false)){ //left
					posX = 0;
					posY = -1;
				}
				else if(validMove(e.x + 1, e.y, false)){ //down
					posX = 1;
					posY = 0;
				}
				else if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
			}
			else if(dy < 0){ //player to right
				if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
				else if(validMove(e.x+1, e.y, false)){ //down
					posX = 1;
					posY = 0;
				}
				else if(validMove(e.x, e.y-1, false)){ //left
					posX = 0;
					posY = -1;
				}
			}
			else if(dy == 0){
				if(validMove(e.x + 1, e.y, false)){ //down
					posX = 1;
					posY = 0;
				}
				else if(validMove(e.x, e.y - 1, false)){ //left
					posX = 0;
					posY = -1;
				} 
				else if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
			}
		}
		else if(dx > 0){ //player is above
			if(dy > 0){ //player to left
				//check valid move in one direction, if not valid, 
				if(validMove(e.x, e.y - 1, false)){ //left
					posX = 0;
					posY = -1;
				}
				else if(validMove(e.x - 1, e.y, false)){ //up
					posX = -1;
					posY = 0;
				}
				else if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
			}
			else if(dy < 0){ //player to right
				if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
				else if(validMove(e.x - 1, e.y, false)){ //up
					posX = -1;
					posY = 0;
				}
				else if(validMove(e.x, e.y -1, false)){ //left
					posX = 0;
					posY = -1;
				}
			}
			else if(dy == 0){
				if(validMove(e.x - 1, e.y, false)){ //up
					posX = -1;
					posY = 0;
				}
				else if(validMove(e.x, e.y - 1, false)){ //left
					posX = 0;
					posY = -1;
				} 
				else if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
			}
		}
		else if(dx == 0){ //player is to the sides
			if(dy < 0){ //right
				if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
				else if(validMove(e.x - 1, e.y, false)){ //up
					posX = -1;
					posY = 0;
				}
				else if(validMove(e.x + 1, e.y, false)){ //down
					posX = 1;
					posY = 0;
				}
			}
			else if(dy > 0){ //left
				if(validMove(e.x, e.y - 1, false)){ //left
					posX = 0;
					posY = -1;
				}
				else if(validMove(e.x - 1, e.y, false)){ //up
					posX = -1;
					posY = 0;
				}
				else if(validMove(e.x + 1, e.y, false)){ //down
					posX = 1;
					posY = 0;
				}
			}
		}
	}
	else{
		//walk randomly
		let rndDir = Math.floor(Math.random() * 4);
		switch(rndDir){
			case 0:
				if(validMove(e.x, e.y - 1, false)){ //left
					posX = 0;
					posY = -1;
				}
				else if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
				break;
			case 1:
				if(validMove(e.x - 1, e.y, false)){ //up
					posX = -1;
					posY = 0;
				}
				else if(validMove(e.x + 1, e.y, false)){ //down
					posX = 1;
					posY = 0;
				}
				break;
			case 2:
				if(validMove(e.x, e.y + 1, false)){ //right
					posX = 0;
					posY = 1;
				}
				else if(validMove(e.x, e.y - 1, false)){ //left
					posX = 0;
					posY = -1;
				}
				break;
			case 3:
				if(validMove(e.x + 1, e.y, false)){ //down
					posX = 1;
					posY = 0;
				}
				else if(validMove(e.x - 1, e.y, false)){ //up
					posX = -1;
					posY = 0;
				}
				else 
				break;
			default:
				break;
		}
	}

	//if new direction has been decided, try to move, otherwise don't do anything
	if(posX != null && posY != null){
		moveTo(e, index, {x: posX, y: posY});
	}
};

/*
	Finds a random position in the map and decides if valid based on 
*/
function getRandomCoords(rooms, actor, object){
	
	//actor and object are booleans that indicate the type of object looking for a position

	let emptyCell = false;	
	let rndRoom;
	let rndRoomX;
	let rndRoomY;

	while(!emptyCell){
		rndRoom = rooms[Math.floor(Math.random() * rooms.length)];

		rndRoomX = rndRoom.tiles[0][Math.floor(Math.random() * rndRoom.tiles[0].length)].x;
		rndRoomY = rndRoom.tiles[Math.floor(Math.random() * rndRoom.tiles.length)][0].y;
		if(map[rndRoomY][rndRoomX] == Tile.FLOOR){
			//don't place actors on top of each other
			if(actor && actorPositions.indexOf(rndRoomX + "_" + rndRoomY) == -1){
					emptyCell = true;
			}
			else if(object){	
				//check that new object does not obstruct player
				let validObjectPosition = objectAreaCheck(rndRoomY, rndRoomX);
				if(validObjectPosition){
					emptyCell = true;
				}
			}
		}
	}
	
	return {x: rndRoomX, y: rndRoomY};
};

/*
	Check to make sure a new object does not block a door or exit tile.
*/
function objectAreaCheck(y, x){

	let doorFound = false;

	if(map[y][x-1] == Tile.DOOR || map[y][x-1] == Tile.EXIT){
		doorFound = true;
	}
	else if(map[y-1][x] == Tile.DOOR || map[y-1][x] == Tile.EXIT){
		doorFound = true;
	}
	else if(map[y][x+1] == Tile.DOOR || map[y][x+1] == Tile.EXIT){
		doorFound = true;
	}
	else if(map[y+1][x] == Tile.DOOR || map[y+1][x] == Tile.EXIT){
		doorFound = true;
	}
	
	return !doorFound;
}

/*
	Moves an actor into a new tile, or attacks the actor in that new tile
*/
function moveTo(actor, index, dir){

	let newPosX = actor.x;	
	let newPosY = actor.y;

	let cellOccupied;
	let actorKilled;


	if(dir.x == 0 && dir.y == -1){ //LEFT
		newPosY -= 1;
		//check if actor in that cell
		cellOccupied = checkCellOccupied(actor.x, newPosY);
		if(cellOccupied){
			//attacks and checks if they died, leaving space free to move into
			actor.sprite.frame = 10;
			actorKilled = attackActor(actor, actor.x, newPosY);
		}
		if(!actorKilled && !cellOccupied){
			actor.sprite.animations.play('walkLeft');
		}
	}
	else if(dir.x == -1 && dir.y == 0){ //UP
		newPosX -= 1;
		//check if actor in that cell
		cellOccupied = checkCellOccupied(newPosX, actor.y);
		if(cellOccupied){
			actor.sprite.frame = 0;
			//attacks and checks if they died, leaving space free to move into
			actorKilled = attackActor(actor, newPosX, actor.y);
		}
		if(!actorKilled && !cellOccupied){
			actor.sprite.animations.play('walkUp'); 
		}
	}
	else if(dir.x == 0 && dir.y == 1){ //RIGHT
		newPosY += 1;
		//check if actor in that cell
		cellOccupied = checkCellOccupied(actor.x, newPosY);
		if(cellOccupied){
			actor.sprite.frame = 30;
			//attacks and checks if they died, leaving space free to move into
			actorKilled = attackActor(actor, actor.x, newPosY);
		}
		if(!actorKilled && !cellOccupied){
			actor.sprite.animations.play('walkRight'); 
		}
	}
	else if(dir.x == 1 && dir.y == 0){ //DOWN
		newPosX += 1;
		//check if actor in that cell
		cellOccupied = checkCellOccupied(newPosX, actor.y);
		if(cellOccupied){
			actor.sprite.frame = 20;
			//attacks and checks if they died, leaving space free to move into
			actorKilled = attackActor(actor, newPosX, actor.y);
		}
		if(!actorKilled && !cellOccupied){
			actor.sprite.animations.play('walkDown');
		}
	}

	//if cell is empty or has enemy corpse, can move into it
	if(!cellOccupied){
		//only move sprite and change x and y position of actor
		//if cell is free to move into

		actorPositions[index] = newPosX + '_' + newPosY;

		actor.x = newPosX;
		actor.y = newPosY;

		//animate to new tile
		Roguelike.game.add.tween(actor.sprite).to({x: newPosY*64, y: newPosX*64}, 200).start();
	}

	return true;
};

/*
	Checks if an actor is at the tile given by x, y.
*/
function checkCellOccupied(x, y){
	//return true if actor is found at x and y, else false
	return actorPositions.indexOf(x + "_" + y) != -1;
}

/*
	If cell is occupied and actors are on opposing sides, attack them
*/
function attackActor(aggressor, x, y){
	//get the victim based on the x and y values of new tile being moved into
	let victimIndex = actorPositions.indexOf(x + "_" + y);
	let victim = actorList[victimIndex];
	let victimDead = false;

	let playerDead = false;

	if(victim != player && aggressor != player){
		//do nothing, victim is friend 
	}
	else{
		if(victim == player){
			//enemy is attacking player
			let aug = player.augmentations.find(function(a){return a.type == Aug.DEF;});
			let playerHit = true;
			if(aug != undefined){
				//if player has dodge chance, determine if they are successful in dodging attack
				let dodgeAmount = 100*(aug.effectVal*aug.level);
				let chanceToHit = 100-dodgeAmount;
				let diceRoll = Math.ceil(Math.random() * 100);
				//random number between 1 and 100
				//if that number is the same or under the chance to hit (of say 95) then deal dmg, otherwise player dodges
				//playerhit is false if missed
				playerHit = diceRoll <= chanceToHit; 
			}
			//if could not dodge
			if(playerHit){
				let pHit = game.add.audio('playerHurt', 0.5); //play sound
				pHit.play();
				//update player HP
				player.hp -= aggressor.dmg;
				if(player.hp < 0) player.hp = 0; //prevent negative hp
				hud.updateReadout("I took " + aggressor.dmg + " damage.");
				hud.updateHP();
				//account for enemy type 2 which can knock the player down
				if(aggressor.type == 2 && !player.isStunned){
					player.isStunned = true;
					player.sprite.kill();
					//add and play the death animation, which works for being knocked down
					player.sprite = game.add.sprite(player.y*64, player.x*64, 'playerDeath', 0); 
					player.sprite.anchor.y = 0.3 ;
					player.sprite.animations.add('playerDeath', [0, 1, 2, 3, 4, 5], 18, false);
					player.sprite.animations.play('playerDeath');
				}
			}
			else{
				let playerDodged = game.add.audio('miss', 0.3).play(); //play dodge sound
				hud.updateReadout("I dodged their attack.");
			}
		}
		else if(aggressor == player){
			//player is attacking an enemy
			
			//check if attack hits (enemy 2 and 3 have dodge chance)
			let chanceToHitEnemy = 100-victim.dodgeChance;
			if(Math.floor(Math.random()*100) <= chanceToHitEnemy){
				let aug = player.augmentations.find(function(a){return a.type == Aug.VAMP;});
				//if player has vampiric augmentation, they can steal HP from enemies
				if(aug != undefined){
					if(player.hp < player.maxHP){
						player.hp += player.dmg*(aug.level * aug.effectVal); //5% vamp to begin with
						if(player.hp > player.maxHP){
							player.hp = player.maxHP;
						}
						hud.updateHP();
					}
				}
				game.add.audio('zap', 0.2, false).play(); //play sound
				victim.hp -= aggressor.dmg;
				hud.updateReadout("I did " + aggressor.dmg + " damage to the enemy.");
				let hurtString;

				//change readout depending on how hurt the enemy is in relation to their maximum HP
				if(victim.hp>victim.maxHP*0.9){
					hud.updateReadout("They look relatively untouched.");
				}
				else if(victim.hp>victim.maxHP*0.5){
					hud.updateReadout("They look hurt.");
				}
				else if(victim.hp<=victim.maxHP*0.25){
					hud.updateReadout("They look close to death.");
				}
				else if(victim.hp<=victim.maxHP*0.5){
					hud.updateReadout("They look badly hurt.");
				}
			}
			else{
				let enemyDodged = game.add.audio('miss', 0.3).play(); //play sound
				hud.updateReadout("They dodged my attack!");
			}
		}

		//if victim has HP <= 0 they are killd
		if(victim.hp <= 0){
			victimDead = true;
			if(victim == player){
				player.sprite.kill();
				player.sprite = game.add.sprite(player.y*64, player.x*64, 'playerDeath', 0); 
				player.sprite.anchor.y = 0.3 ;
				//play death animation
				player.sprite.animations.add('playerDeath', [0, 1, 2, 3, 4, 5], 18, false);
				player.sprite.animations.play('playerDeath');
				//flag for game over
				playerDead = true;
			}
			else{
				//if enemy killed, update score, exp and credits
				player.score += victim.score;
				player.exp += victim.exp;
				hud.updateEXP();
				hud.updateReadout("Enemy killed. I found " + victim.credits + " credits on them.");

				//if player has gained enough EXP, their level and stats increase
				if(player.exp >= expThreshold){
					//UPDATE HUD
					player.lvl++;
					player.maxHP += 5;
					player.hp+=5;
					player.dmg += 2;

					expThreshold *= 2;
					hud.updateReadout("I feel stronger.");
					hud.updateDMG();
					hud.updateHP();
					hud.updateLevel();
					hud.updateEXP();
					console.log("LEVEL UP!");
					console.log(player);
				}
				player.credits += victim.credits;
				creditsEarned += victim.credits;
				hud.updateCredits();
				victim.sprite.kill();
				let deathSpriteName;

				//choose a different sprite depending on enemy type
				if(victim.type == 1){
					deathSpriteName = 'armor1Death';
				}
				else if(victim.type == 2){
					deathSpriteName = 'armor2Death';
				}
				else if(victim.type == 3){
					deathSpriteName = 'agentDeath';
				}
				let deathSprite = game.add.sprite(victim.y*64, victim.x*64, deathSpriteName, 0); 
				deathSprite.anchor.y = 0.3 ;
				deathSprite.animations.add(deathSprite, [0, 1, 2, 3, 4, 5], 18, false);
				deathSprite.animations.play(deathSprite);
				hud.initHUD(); //hud covers corpses

				actorList.splice(victimIndex, 1);
				actorPositions.splice(victimIndex, 1);
				enemiesKilled++;
			}
		}
	}

	//game over if player is dead
	if(playerDead){
		showGameOverScreen("Defeat");

	}
	else{
		//return true if victim has died and cell is now free to move into
		return victimDead;
	}
};

/*
	Upon reaching the floor exit, the player can choose which foor to tackle next.
*/
function showFloorSelectScreen(){

	let graphics = game.add.graphics(0, 0);

	graphics.beginFill(0x222222);
   	graphics.lineStyle(1, 0xffffff, 1);
   	let floorSelectBackground = graphics.drawRect(200, 100, game.width-400, game.height-300);
   	floorSelectBackground.fixedToCamera = true;
   	graphics.endFill();

   	let textGroup = game.add.group();

   	//choice of floors is current+1 or current+2, allowing player to skip a floor
   	let floorSelectText = "Floor Selection";
   	let choice1Text = "Floor " + (floorNumber+1);
   	let choice2Text = "Floor " + (floorNumber+2);
   	let stayText = "Stay on this floor.";

   	let optionPicked = false;

   	floorSelectText = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2-150), floorSelectText, { font: "24px Consolas", fill: "#0055DD" }, textGroup);
   	floorSelectText.fixedToCamera = true;
   	floorSelectText.anchor.x = 0.5;

   	choice1Text = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2-80), choice1Text, { font: "15px Consolas", fill: "#fff" }, textGroup);
   	choice1Text.fixedToCamera = true;
   	choice1Text.anchor.x = 0.5;
   	choice1Text.inputEnabled = true;
	choice1Text.events.onInputDown.add(function(){
		textGroup.destroy(); 
		graphics.destroy(); 
		setupFloor(++floorNumber, player); //sets up new floor, with new enemies, items, but the same player (in a new position)
	}, this);
	//toggles colour for highlighting
	choice1Text.events.onInputOver.add(function(){choice1Text.fill = "#FF0000";}, this);
	choice1Text.events.onInputOut.add(function(){choice1Text.fill = "#fff";}, this);

	//when on the penultimate floor, can only go to top floor
	if(floorNumber < topFloor-1){
		choice2Text = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2-50), choice2Text, { font: "15px Consolas", fill: "#fff" }, textGroup);
	   	choice2Text.fixedToCamera = true;
	   	choice2Text.anchor.x = 0.5;
	   	choice2Text.inputEnabled = true;
		choice2Text.events.onInputDown.add(function(){textGroup.destroy(); graphics.destroy(); setupFloor(floorNumber+=2, player);}, this);
		choice2Text.events.onInputOver.add(function(){choice2Text.fill = "#FF0000";}, this);
		choice2Text.events.onInputOut.add(function(){choice2Text.fill = "#fff";}, this);
	}
 
	stayText = game.add.text(Math.floor(game.width/2), Math.floor(game.height/2), stayText, { font: "15px Consolas", fill: "#fff" }, textGroup);
   	stayText.fixedToCamera = true;
   	stayText.anchor.x = 0.5;
   	stayText.inputEnabled = true;
	stayText.events.onInputDown.add(function(){textGroup.destroy(); graphics.destroy();}, this);
	stayText.events.onInputOver.add(function(){stayText.fill = "#FF0000";}, this);
	stayText.events.onInputOut.add(function(){stayText.fill = "#fff";}, this);
}

/*
	Shows the game over screen, which is shown if the player wins or loses
*/
function showGameOverScreen(message){
	//the colour of the text depends on if the player wins or loses (determined by message value)
	let gameOverColour = (message == "Victory") ? "#19de65" : "#FF0000";
	music.stop();
	gameOver = true;

	if(message != "Victory"){
		//if player has been defeated, play the 'game over' sound clip
		let gameOverSound = game.add.audio('gameOver')
		gameOverSound.play();
	}

	let graphics = game.add.graphics(0, 0);

	graphics.beginFill(0x222222);
   	graphics.lineStyle(1, 0x444444, 1);
   	let gameOverBackground = graphics.drawRect(game.width/3, 100, game.width/3, game.height-220);
   	gameOverBackground.fixedToCamera = true;
   	graphics.endFill();

   	let textGroup = game.add.group();

   	let floorsCleared = (message == "Victory") ? topFloor : --floorNumber;
   	player.score += (1000*floorsCleared); //adds score based on number of floors cleared

   	//generate text strings and score values
   	let gameOverText = message;
   	let statsText = "Stats";
   	let killedText = "Enemies Killed: " + enemiesKilled;
   	let scoreText = "Score: " + player.score;
   	let creditsText = "Credits earned: " + creditsEarned;
   	let levelText = "Level: " + player.lvl;
   	let floorsClearedText = "Floors cleared:" + floorsCleared;
   	let returnText = "Return to menu?";
   	let restartText = "Restart?";

   	let optionPicked = false;
   	let xOffset = game.width/2;
   	let yOffset = game.height/2-50;

   	gameOverText = game.add.text(Math.floor(xOffset), Math.floor(yOffset-100), gameOverText, gameOverStyle, textGroup);
   	gameOverText.fill = gameOverColour;
   	gameOverText.fixedToCamera = true;
   	gameOverText.anchor.x = 0.5;

   	statsText = game.add.text(Math.floor(xOffset), Math.floor(yOffset-40), statsText, titleStyle, textGroup);
   	statsText.fixedToCamera = true;
   	statsText.anchor.x = 0.5;

   	killedText = game.add.text(Math.floor(xOffset), Math.floor(yOffset-10), killedText, mainTextStyle, textGroup);
   	killedText.fixedToCamera = true;
   	killedText.anchor.x = 1;

   	scoreText = game.add.text(Math.floor(xOffset), Math.floor(yOffset+10), scoreText, mainTextStyle, textGroup);
   	scoreText.fixedToCamera = true;
    scoreText.anchor.x = 1;

   	creditsText = game.add.text(Math.floor(xOffset), Math.floor(yOffset+30), creditsText, mainTextStyle, textGroup);
   	creditsText.fixedToCamera = true;
   	creditsText.anchor.x = 1;

   	levelText = game.add.text(Math.floor(xOffset), Math.floor(yOffset+50), levelText, mainTextStyle, textGroup);
   	levelText.fixedToCamera = true;
   	levelText.anchor.x = 1;

   	floorsClearedText = game.add.text(Math.floor(xOffset), Math.floor(yOffset+70), floorsClearedText, mainTextStyle, textGroup);
   	floorsClearedText.fixedToCamera = true;
   	floorsClearedText.anchor.x = 1;


   	//return to menu functionality
	returnText = game.add.text(Math.floor(xOffset), Math.floor(yOffset+120), returnText, mainTextStyle, textGroup);
	returnText.fill = "#19de65";
	returnText.fixedToCamera = true;
	returnText.inputEnabled = true;
	returnText.anchor.x = 0.5;
	returnText.events.onInputDown.add(function(){
		textGroup.destroy(); 
		graphics.destroy(); 
		game.state.start('MainMenu');
	}, this);
	returnText.events.onInputOver.add(function(){returnText.fill = "#FF0000";}, this);
	returnText.events.onInputOut.add(function(){returnText.fill = "#19de65";}, this);

	//restart game (floor 1, new player)
	restartText = game.add.text(Math.floor(xOffset), Math.floor(yOffset+150), restartText, mainTextStyle, textGroup);
	restartText.fill = "#19de65";
	restartText.fixedToCamera = true;
	restartText.inputEnabled = true;
	restartText.anchor.x = 0.5
	restartText.events.onInputDown.add(function(){; 
		textGroup.destroy(); 
		graphics.destroy(); 
		game.state.start('Game');
	}, this);
	restartText.events.onInputOver.add(function(){restartText.fill = "#FF0000";}, this);
	restartText.events.onInputOut.add(function(){restartText.fill = "#19de65";}, this);
}

/*
	Contains rules about what tiles can be move into, for both players and enemies
*/
function validMove(mX, mY, player){

	if(map[mX][mY] == Tile.WALL){
		//console.log("found wall");
		return false;
	}
	else if(map[mX][mY] == Tile.DOOR){
		//can move into doorways
		//if locked/unlocked doors were implented, the logic would be handled here
	}
	else if(map[mX][mY] == Tile.EXIT){
		//only the player can enter the exit tile
		if(!player) return false;
	}
	else if(map[mX][mY] == Tile.TERMINAL){
		//terminals block movement
		return false;
	}
	else if(map[mX][mY] == Tile.LOOT){
		//loot boxes block movement
		return false;
	}
	else if(mX <= 0 || mY <= 0){
		//actors cannot leave the perimeter of the map
		return false;
	}
		
	return true;
};

/*
	Enums for wall types
*/
var Tile = {
	WALL: '#',
	FLOOR: '.',
	DOOR: 'D',
	EXIT: 'X',
	TERMINAL: 'T',
	LOOT: 'L'
};

/*
	Room object contains booleans for whether it can expand in each direction and contains references to neighbouring rooms.
*/
function Room(num){
	this.id = num;
	this.tiles = [];
	this.x; 
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
	// debugging
	// this.roomToLeft = 0;
	// this.roomToTop = 0;
	// this.roomToRight = 0;
	// this.roomToBot = 0;
};

/*
	Terminal object is either a finalMainframe or normal terminal, and has different options to reflect this.
*/
function Terminal(options, x, y, final){
	this.options = options;
	this.sprite = (final) ? game.add.sprite(y*64, x*64, 'terminal2') : game.add.sprite(y*64, x*64, 'terminal1'); 
	this.graphics = null;
	this.textGroup = null;
	this.finalMainframe = final;
	this.terminalHum;
	this.terminalStart;
};

Terminal.prototype = {
	displayTerminal: function(){

		if(this.terminalHum == null){
			this.terminalHum = game.add.audio('terminalHum', 1.25);
		}
		else if(!this.terminalHum.isPlaying) this.terminalHum.play(); //play audio

		player.isUsingTerminal = true; //player cannot move

		//for refreshes, ensures no overlaying of text or graphical elements
		if(this.textGroup != null){
			this.terminalStart = false;
			this.textGroup.destroy();
		}
		else{
			this.terminalStart = true;
		}

		if(this.graphics != null){
			this.graphics.destroy();
		}

		this.graphics = game.add.graphics(0, 0);

		this.graphics.beginFill(0x000000);
	   	this.graphics.lineStyle(10, 0x111111, 3);
	   	let terminalBackground = this.graphics.drawRect(game.width/4, 100, game.width/2, game.height-250);
	   	terminalBackground.fixedToCamera = true;
	   	this.graphics.endFill();

	   	//offset for relative placements
	   	let yOffset = game.height/2;

		if(!this.finalMainframe){
			
		   	let bootText = "Booting into P.R.A.S.H system, please wait";
		   	let fillerText = ".....";
		   	let welcomeText = "Welcome " + playerName + ", how may I help you today?";

		    this.textGroup = game.add.group();

		    //text is initially invisible, to be animated to fade in.

		   	bootText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-150), bootText, { font: "18px Consolas", fill: "#19de65" }, this.textGroup);
		   	bootText.fixedToCamera = true;
		   	bootText.anchor.x = 0.5;
		    if(this.terminalStart){	bootText.alpha = 0;}

		  	let fillerText1 = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-120), fillerText, { font: "18px Consolas", fill: "#19de65" }, this.textGroup);
	   		fillerText1.fixedToCamera = true;
	   		fillerText1.anchor.x = 0.5;
	   		if(this.terminalStart){fillerText1.alpha = 0;}

	   		let fillerText2 = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-90), fillerText, { font: "18px Consolas", fill: "#19de65" }, this.textGroup);
	   		fillerText2.fixedToCamera = true;
	   		fillerText2.anchor.x = 0.5;
	   		if(this.terminalStart){fillerText2.alpha = 0;}
	   		
	   		welcomeText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-60), welcomeText, { font: "18px Consolas", fill: "#19de65" }, this.textGroup);
	   		welcomeText.fixedToCamera = true;
	   		welcomeText.anchor.x = 0.5;
	   		if(this.terminalStart){welcomeText.alpha = 0;}

	   		//colour of options depends on whether player can afford them

	   		let purchaseStyle = { font: "18px Consolas", fill: "#19de65" };

	   		if(player.credits < healCost){
	   			purchaseStyle = { font: "18px Consolas", fill: "#FF0000" };
	   		}

			let healText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset), this.options[0] + " (" + healCost + ")", purchaseStyle, this.textGroup);
			healText.fixedToCamera = true;
			healText.inputEnabled = true;
			healText.anchor.x = 0.5;
			healText.events.onInputDown.add(this.healPlayer, this);
			if(this.terminalStart){healText.alpha = 0;}

			if(player.credits >= healCost){
				healText.events.onInputOver.add(this.overOption, this);
				healText.events.onInputOut.add(this.outOption, this);
			}

			if(player.credits < upgradeDmgCost){
	   			purchaseStyle = { font: "18px Consolas", fill: "#FF0000" }
	   		}

			let upgradeDmgText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset+30), this.options[1] + " (" + upgradeDmgCost + ")", purchaseStyle, this.textGroup);
			upgradeDmgText.fixedToCamera = true;
			upgradeDmgText.inputEnabled = true;
			upgradeDmgText.anchor.x = 0.5;
			upgradeDmgText.events.onInputDown.add(this.upgradeDMG, this);
			if(this.terminalStart){upgradeDmgText.alpha = 0;}

			if(player.credits >= upgradeDmgCost){
				upgradeDmgText.events.onInputOver.add(this.overOption, this);
				upgradeDmgText.events.onInputOut.add(this.outOption, this);
			}

			if(player.credits < upgradeHpCost){
	   			purchaseStyle = { font: "18px Consolas", fill: "#FF0000" }
	   		}

			let upgradeHPText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset+60), this.options[2] + " (" + upgradeHpCost + ")", purchaseStyle, this.textGroup);
			upgradeHPText.fixedToCamera = true;
			upgradeHPText.inputEnabled = true;
			upgradeHPText.anchor.x = 0.5;
			upgradeHPText.events.onInputDown.add(this.upgradeHP, this);
			if(this.terminalStart){upgradeHPText.alpha = 0;}

			if(player.credits >= upgradeHpCost){
				upgradeHPText.events.onInputOver.add(this.overOption, this);
				upgradeHPText.events.onInputOut.add(this.outOption, this);
			}
		}
		//final mainframe
		else{
			let bootText = "P.R.A.S.H mainframe accessed. ";
			let fillerText = ".....";
		   	let intruderText = "INTRUDER DETECTED.";
		   	let pleaseText = "Please " + playerName + "...you don't need to do this.";

		   	hud.updateReadout("This must be the mainframe I've been looking for!");

		    this.textGroup = game.add.group();

		   	bootText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-150), bootText, { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
		   	bootText.fixedToCamera = true;
		   	bootText.anchor.x = 0.5;
		    if(this.terminalStart){	bootText.alpha = 0;}

		   	let fillerText1 = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-120), fillerText, { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
	   		fillerText1.fixedToCamera = true;
	   		fillerText1.anchor.x = 0.5;
	   		if(this.terminalStart){fillerText1.alpha = 0;}

		  	intruderText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-90), intruderText, { font: "15px Consolas", fill: "#ff0000" }, this.textGroup);
	   		intruderText.fixedToCamera = true;
	   		intruderText.anchor.x = 0.5;
	   		if(this.terminalStart){intruderText.alpha = 0;}

	   		pleaseText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-30), pleaseText, { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
	   		pleaseText.fixedToCamera = true;
	   		pleaseText.anchor.x = 0.5;
	   		if(this.terminalStart){pleaseText.alpha = 0;}

	   		let virusText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset+30), this.options[0], { font: "32px Consolas", fill: "#0055DD" }, this.textGroup);
			virusText.fixedToCamera = true;
			virusText.inputEnabled = true;
			virusText.anchor.x = 0.5;
			hud.updateReadout("Virus uploading...");
			virusText.events.onInputDown.add(this.finalMainframeHack, this);
			virusText.events.onInputOver.add(this.overOption, this);
			virusText.events.onInputOut.add(function(){ virusText.fill = "#0055DD"});
			if(this.terminalStart){virusText.alpha = 0;}
		}
		
		let logoffText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset+90), this.options[3], { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
		logoffText.fixedToCamera = true;
		logoffText.inputEnabled = true;
		logoffText.anchor.x = 0.5;
		//once the player has logged off, we allow for controls again, using onInputUp avoid movement with log off click
		logoffText.events.onInputUp.add(function(){ 
			this.textGroup.destroy(); 
			this.graphics.destroy(); 
			player.isUsingTerminal = false; 
			game.add.audio('mouseClick', 0.5).play();
			this.terminalHum.stop();
		}, this);
		logoffText.events.onInputOver.add(this.overOption, this);
		logoffText.events.onInputOut.add(this.outOption, this);
		if(this.terminalStart){logoffText.alpha = 0;}

		let animations = [];
		let time = 0;

		//if terminal used for first time, animate the text
		if(this.terminalStart){
			for(let i = 0; i < this.textGroup.length; i++){
				animations.push(game.add.tween(this.textGroup.children[i]).to({alpha: 1}, 500, Phaser.Easing.Linear.None));	
				setTimeout(function(){
					animations[i].start();
				}, time+(i*100));
			}
		}
	},
	healPlayer: function(){
		game.add.audio('mouseClick').play(); //play sound
		//player HP cannot go above their Max HP
		if(player.hp == player.maxHP){
			hud.updateReadout("I'm already fully healed.");
		}
		//if player can afford
		else if(player.credits >= healCost){
			if(player.hp + 50 <= player.maxHP){
				player.hp += 50;
			}
			else{
				player.hp = player.maxHP;
			}
			hud.updateReadout("I feel better.");
			player.credits -= healCost;
			hud.updateCredits();
			hud.updateHP();

			this.displayTerminal();
		}
		else{
			hud.updateReadout("I don't have enough credits.");
		}
	},
	upgradeDMG: function(){
		game.add.audio('mouseClick').play();
		//if player can afford
		if(player.credits >= upgradeDmgCost){
			player.credits -= upgradeDmgCost;
			hud.updateCredits();

			hud.updateReadout("I feel more powerful.");

			player.dmg += 5;
			hud.updateDMG();

			upgradeDmgCost *= 2; //doubles the cost of upgrading each time

			this.displayTerminal();
		}
		else{
			hud.updateReadout("I don't have enough credits.");
		}
	},
	upgradeHP: function(){
		game.add.audio('mouseClick').play();
		//if player can afford
		if(player.credits >= upgradeHpCost){
			player.credits -= upgradeHpCost;
			hud.updateCredits();

			hud.updateReadout("I feel healthier.");

			//increase both max hp and current hp
			player.maxHP += 10;
			player.hp += 10;
			hud.updateHP();

			upgradeHpCost *= 2; //doubles upgrade cost each time

			this.displayTerminal();
		}
		else{
			hud.updateReadout("I don't have enough credits.");
		}
	},
	finalMainframeHack : function(){
		//choosing the hack option on the final mainframe leads to the player being victorious and ending the game
		showGameOverScreen("Victory");
	},
	overOption: function(item, valid){
		if(valid){
			item.fill = "#FF0000"; //toggle colour
		}
	},
	outOption: function(item, valid){
		if(valid){
			item.fill = "#19de65"; //toggle colour
		}
	}
};

/*
	The player object contains the player's stats, credits, augmentations and boolean flags for certain situations
*/
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
	this.isUsingTerminal = false;
	this.isUsingLoot = false;
	this.isViewingHelp = false;
	this.augmentations = [];
};

/*
	The enemy object has similar information to the player, they also have experience and score values, as well as booleans for alert state
*/
function Enemy(game, x, y, hp, ap, dmg, spriteName, type){
	this.game = game;
	this.x = x;	
	this.y = y;
	this.hp = hp;
	this.maxHP = hp;
	this.ap = ap;
	this.maxAP = ap;
	this.dmg = dmg;
	this.sprite = this.game.add.sprite(y*64, x*64, spriteName, 19); 
	this.type = type;
	this.isAlive = true;
	this.alerted = false;
	this.dodgeChance = 5*(type-1);
	this.exp = 100*type;
	this.score = 100*type*floorNumber;
	this.credits = 10*(type*type);
};

/*
	Creates the 2D array with width and height equal to the mapSize, then creates 3x3 rooms that do not overlap or go out of bounds.
*/
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

	//these values prevent it from trying to place rooms on the perimeter
	let minXY = 2;
	let maxXY = mapSize-3;
	let roomsLeftToBePlaced = numRooms;

	//loop continues until all rooms have been placed
	while(roomsLeftToBePlaced > 0){

		let x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		let y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;

		let validRoom = false;
		//find a spot for valid room
		while(!validRoom){
		 	if(map[x][y] != Tile.FLOOR){
		 		//check that you can fit a 3x3 room at this location
		 		validRoom = checkValidRoomSize(x, y);
		 		if(!validRoom){
		 			//try new location
		 			x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
					y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		 		} 
		 	}
		 	else{
		 		//try new location
		 		x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
				y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		 	}
		}

		//change the valid tiles from WALLs to FLOORs
		map[x-1][y-1] = Tile.FLOOR;
		map[x][y-1] = Tile.FLOOR;
		map[x+1][y-1] = Tile.FLOOR;
		map[x-1][y] = Tile.FLOOR;
		map[x][y] = Tile.FLOOR;
		map[x+1][y] = Tile.FLOOR;
		map[x-1][y+1] = Tile.FLOOR;
		map[x][y+1] = Tile.FLOOR;
		map[x+1][y+1] = Tile.FLOOR;

		let currentRoom = numRooms - roomsLeftToBePlaced; 

		//create new Room object and fill its tile array
		let room  = new Room(currentRoom);
		room.tiles[0] = [{x: x-1, y: y-1}, {x: x, y: y-1}, {x: x+1, y: y-1}];
		room.tiles[1] = [{x: x-1, y: y}, {x: x, y: y}, {x: x+1, y: y}];
		room.tiles[2] = [{x: x-1, y: y+1}, {x : x, y: y+1}, {x: x+1, y: y+1}];

		//add new room to rooms array
		rooms[currentRoom] = room;

		roomsLeftToBePlaced--;
	}
};

/*
	Checks that area surrounding 3x3 room is all walls, to avoid overlapping
*/
function checkValidRoomSize(x, y){
	//console.log("in checkvalidroom");

	let space = false;

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

/*
	This function expands a random wall of a random room until all possible expansions have been made.
*/
function expandRandomRooms(){

	let roomCannotExpand = 0;

	while(roomCannotExpand < numRooms){
		//pick a random room and random direction in which to expand
		let rndRoom = Math.floor(Math.random() * rooms.length);
		let rndDir = Math.floor(Math.random() * 4);

		let checkRoom = rooms[rndRoom];

		if(checkRoom.canExp){
			//attempts to expand room in random direction
			let expResult = expand(checkRoom, rndDir);
			
			//debugging
			// if(!expResult){
			// 	console.log("Couldn't expand room ", checkRoom.id);
			// }
			// else{
			// 	console.log("Expanded room ", checkRoom.id);
			// }

			if(!expResult && !checkRoom.expLeft
				&& !checkRoom.expTop
				&&!checkRoom.expRight
				&& !checkRoom.expBot){
				checkRoom.canExp = false;
				roomCannotExpand++;
			}
		}
		else{
			//debugging
			//console.log("Room ", checkRoom.id, " cannot be expanded further, but still being considered.");
		}
	}
};

/*
	Attempts to move one of the room's walls one tile in a defined direction.
	Definitely could benefit from a proper refactor as it's hard to follow.
*/
function expand(r, d){

	let success;
	let newAdjRoom = false;

	switch(d){
		case 0: //LEFT
			success = false;
			if(r.expLeft){
				//check if trying to expand out of bounds
				let oobCheck = r.tiles[0][0].y-2;
				if(oobCheck >= 0){
					let roomToExpand = true;

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

							//found an adjacent room for first time
							if(!newAdjRoom){
								newAdjRoom = true;

								if(map[checkX][checkY-1]== Tile.FLOOR){
									//debug
								}
								//finds which room that room cell belongs to
								let adjRoom = findAdjacentCell(0, checkX, checkY-2);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									//if room has not already been added to list
									r.adjacentRooms.push(adjRoom);
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX, fY: checkY-2, oX: 0, oY: -2});
									//debugging
									r.roomToLeft++; 
									r.adjRoomCount++; 
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									//if the adjacent room already contains a reference of this room
									rooms[adjRoom].adjacentRooms.push(r.id);
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX, fY: checkY-2, oX: 0, oY: -2});
									//debugging
									rooms[adjRoom].roomToRight++;
									rooms[adjRoom].adjRoomCount++;
								}
							}
							
						}
						else if(map[checkX][checkY-2] == Tile.WALL || i == r.tiles[0].length-1){
							newAdjRoom = false;
						}	
						
					}

					//if can expand in that direction, no overlaps or OOB
					if(roomToExpand){
						//add new space 
						r.tiles.unshift([]);
						for(let i = 0; i < r.tiles[1].length; i++){
							let newX = r.tiles[1][i].x;
							let newY = r.tiles[1][i].y-1;
							
							r.tiles[0].push({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							success = true;
						}
					}
					else{
						//flag that this room cannot expand further in that direction
						r.expLeft = false;
					}
				}
				else{
					//OOB left
					r.expLeft = false;
				}
			}
			return success;
			break;
		case 1: //TOP
			success = false;
			if(r.expTop){
				let oobCheck = r.tiles[0][0].x-2;
				if(oobCheck >= 0){
					let roomToExpand = true;

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
								if(map[checkX-1][checkY] == Tile.FLOOR){
									//debug
								}
								let adjRoom = findAdjacentCell(1, checkX-2, checkY);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX-2, fY: checkY, oX: -2, oY: 0});
									r.roomToTop++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX-2, fY: checkY, oX: -2, oY: 0});
									rooms[adjRoom].roomToBot++;
									rooms[adjRoom].adjRoomCount++;
								}
							}
							
						}
						else if(map[checkX-2][checkY] == Tile.WALL || i == r.tiles.length-1){
							newAdjRoom = false;
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
					}
					else{
						r.expTop = false;
					}
				}
				else{
					r.expTop = false;
				}
			}
			return success;
			break;
		case 2: //RIGHT
			success = false;
			if(r.expRight){
				let oobCheck = r.tiles[r.tiles.length-1][0].y+2;
				if(oobCheck < mapSize){
					let roomToExpand = true;

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

							if(!newAdjRoom){
								newAdjRoom = true;

								if(map[checkX][checkY+1] == Tile.FLOOR){
									//debug
								}
								let adjRoom = findAdjacentCell(2, checkX, checkY+2);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX, fY: checkY+2, oX: 0, oY: 2});
									r.roomToRight++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX, fY: checkY+2, oX: 0, oY: 2});
									rooms[adjRoom].roomToLeft++;
									rooms[adjRoom].adjRoomCount++;
								}
								//console.log("New adjacent room found (right)");
							}
							
						}
						else if(map[checkX][checkY+2] == Tile.WALL || i == r.tiles[0].length-1){
							newAdjRoom = false;
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
			return success;
			break;
		case 3: //BOT
			success = false;
			if(r.expBot){
				let oobCheck = r.tiles[0][r.tiles[0].length-1].x+2;
				if(oobCheck < mapSize){
					let roomToExpand = true;

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

							if(!newAdjRoom){
								newAdjRoom = true;
								if(map[checkX+1 ][checkY] == Tile.FLOOR){
									// debug;
								}

								let adjRoom = findAdjacentCell(3, checkX+2, checkY);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);
									r.adjacentRoomCells.push({r: adjRoom, addedBy: r.id, fX: checkX+2, fY: checkY, oX: 2, oY: 0});
									r.roomToBot++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);
									rooms[adjRoom].adjacentRoomCells.push({r: r.id, addedBy: r.id, fX: checkX+2, fY: checkY, oX: 2, oY: 0});
									rooms[adjRoom].roomToTop++;
									rooms[adjRoom].adjRoomCount++;
								}
								// console.log("New adjacent room found (bot)");
							}
							
						}
						else if(map[checkX+2][checkY] == Tile.WALL || i == r.tiles.length-1){
							newAdjRoom = false;
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
			return success;
			break;
		default:
			// console.log("invalid case number");
			break;
	}
};

/*
	When an adjacent room is found, this method finds which room it is.
*/
function findAdjacentCell(d, cX, cY){

	let iX;
	let iY;

	let cellFound = false;
	let p = 0;
	let chkTiles;

	let l;

	while(!cellFound && p < rooms.length){
		chkTiles = rooms[p].tiles;

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

	return p; //roomID
};

/*
	Randomly 'places' rooms and then randomly connects them to adjacent rooms.
*/
function randomlyConnectAdjacentRooms(){

	let roomsToBePlaced = rooms.slice();

	let placedRooms = [];
	let adjacentRoomPool = [];
	let numPlaced = 0;

	doors = [];

	let rndRoomNum;

	while(numPlaced < numRooms){
		//first iteration: remove random room from ToBePlaced and add it to placed rooms
		//second onwards: room has been randomly selected from adjacent rooms list

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
				}
			}
		}
		
		//get room
		let newRoom = roomsToBePlaced.find(function(room){ return room.id == rndRoomNum;})

		placedRooms.push(newRoom);

		//remove from room to be placed
		roomsToBePlaced.splice(roomsToBePlaced.indexOf(newRoom),1);

		for(let i = 0; i < newRoom.adjacentRooms.length; i++){
			//only add if unique reference
			if(adjacentRoomPool.indexOf(newRoom.adjacentRooms[i]) == -1){
				adjacentRoomPool.push(newRoom.adjacentRooms[i]);
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

			//finds the placed room that has the most connections already, to create hub rooms
			for(let i = 0; i < possibleConnections.length; i++){
				if(possibleConnections[i].doors > highestDoorCount){
					roomsWithMostDoors = [];
					roomWithMostDoors.push(possibleConnections[i]);
					highestDoorCount = possibleConnections[i].doors
					tie = false;
				}
				else if(possibleConnections[i].doors == highestDoorCount)
				{
					//more than one room have equal number of connections, need to randomly choose
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
				return room.id == connectionChoice.id;
			})

			//remove connection from pool as it has been picked
			adjacentRoomPool.splice(adjacentRoomPool.indexOf(roomToConnect.id), 1);
			adjacentRoomPool.splice(adjacentRoomPool.indexOf(newRoom.id), 1);

			//we have reference to first cell of adjacency, room.adjacentRooms[i].fX and fY
			//we have placedRooms array which contains both rooms (newRoom & roomToConnect)
			let adjacencyObj = newRoom.adjacentRoomCells.find(function(adj){
				return adj.r == roomToConnect.id;
			});

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

			//need to work out which direction the adjoining wall is
			if(oY < 0){
				//console.log("connectedRoom is to RIGHT");
				chkTiles = [];
				l = roomA.tiles[0].length;
				for(let t = 0; t < l; t++){
					chkTiles.push(roomA.tiles[roomA.tiles.length-1][t]);
				}
				xOffset = 0;
				yOffset = 2;
				wOffsetX = 0;
				wOffsetY = 1;
			}
			else if(oX < 0){
				//console.log("connectedRoom is to BOT");
				chkTiles = [];
				l = roomA.tiles.length; 
				for(let t = 0; t < roomA.tiles.length; t++){
					chkTiles.push(roomA.tiles[t][roomA.tiles[0].length-1]);
				}
				xOffset = 2;
				yOffset = 0;
				wOffsetX = 1;
				wOffsetY = 0;
			}
			else if(oY > 0){
				//console.log("connectedRoom is to LEFT");
				chkTiles = [];
				l = roomA.tiles[0].length;
				for(let t = 0; t < l; t++){
					chkTiles.push(roomA.tiles[0][t]);
				}
				xOffset = 0;
				yOffset = -2;
				wOffsetX = 0;
				wOffsetY = -1;
			}
			else if(oX > 0){
				//console.log("connectedRoom is to TOP");
				chkTiles = [];
				l = roomA.tiles.length;
				for(let t = 0; t < roomA.tiles.length; t++){
					chkTiles.push(roomA.tiles[t][0]);
				}
				xOffset = -2;
				yOffset = 0;
				wOffsetX = -1;
				wOffsetY = 0;
			}

			let endOfSharedWallFound = false;
			let ct = 0;
			let sharedWallLength = 0;
			let sharedWall = [];


			while(!endOfSharedWallFound && ct < l){
				//work out direction of walls, left/right or up/down
				//find out who's side the fX and fY values are on
				//check both sides until a wall intersects, meaning the shareWall is ended
				//take the length of sharedWall /2 and place doo
				
				let chkX = chkTiles[ct].x;
				let chkY = chkTiles[ct].y;

				if(chkX >= fX && chkY >= fY){
					//while they are sharing a wall (floor tiles on both sides of it)
					if(map[chkX+xOffset][chkY+yOffset] == Tile.FLOOR){
						sharedWallLength++;
						sharedWall.push({x: chkX+wOffsetX, y: chkY+wOffsetY});
					}
					else{
						//console.log("HIT WALL");
						endOfSharedWallFound = true;
					}
				}

				ct++;
			}


			//work out where to place the door. Half the wall length if more than 1 tile is shared.
			if(sharedWall.length == 1){
				console.log("TINY WALL");
				map[sharedWall[0].x][sharedWall[0].y] = Tile.DOOR; 
				doors.push({x: sharedWall[0].x, y: sharedWall[0].y});
			}
			else{
				let halfWayPoint = Math.floor(sharedWallLength/2);
				let newDoorPosition = sharedWall[halfWayPoint-1];

				//console.log("halfWayPoint: " + halfWayPoint);
				//console.log("newDoorPosition: " + newDoorPosition);

				map[newDoorPosition.x][newDoorPosition.y] = Tile.DOOR;
				doors.push({x: newDoorPosition.x, y: newDoorPosition.y});
			}
		}
	}
}






