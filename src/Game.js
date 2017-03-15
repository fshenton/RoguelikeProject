'use strict';

//var Roguelike = Roguelike || {};

const mapSize = 30; //40
const minRoomsize = 3;
const numRooms = 25;
const floorChar = 'R';
const wallChar = 'w';
const numEnemies = 20; //20

const terminalNumber = 3;
const lootNumber = 5;

var titleStyle = {font: "24px Consolas", fill: "#fff"};
var gameOverStyle = {font: "48px Consolas", fill: "#fff"};
var mainTextStyle = {font: "12px Consolas", fill: "#fff", align: "left"};

//numitems
//numterminals

//PUT ALL IN GAME.PROTOYPE

var game;

var floorNumber;
var topFloor = 10;
var expThreshold;

var enemyRatios;

var gameOver;

var hud;

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

// (function (){

Roguelike.Game = function(){};

Roguelike.Game.prototype = {
	create: function(){

		game = this.game;
		
		floorNumber = 1;
		gameOver = false;

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

		//title = document.getElementById("gametitle");
		//title.style.visibility = "visible";

		setupFloor(floorNumber);

		//Area outside of level is only to the right/bot of the map, as map is placed at 0,0
		this.game.world.resize(1920,2120);

		//for level change, the enemiesKilled should be persistant
		enemiesKilled = 0;

		//for level change, the creditsEarned should be persistant
		creditsEarned = 0;

		//for level change, the current values should be carried over
		expThreshold = 800;
		healCost = 50;
		upgradeDmgCost = 200;
		upgradeHpCost = 200;

		hud = new HUD(this.game);
		hud.initHUD("I need to find a way to the top floor.");

		cursors = this.game.input.keyboard.createCursorKeys();
		this.input.keyboard.addCallbacks(null, null, this.onKeyUp);

		this.input.onTap.add(this.onMouseTap, this);

		console.log("New Game Started");

		//this.game.add.audio('scary').play();
		//this.game.add.audio('mysterious', 0.1, false).play();

		//music = this.game.add.audio('Enthusiast', 0.2, true);
		
		music = this.game.add.audio('eCommerce', 0.2, true);

		heartbeat = this.game.add.audio('heartbeat', 0.3);
		music.play();
	},
	/*update: function(){
	},*/
	onKeyUp: function(event){

		let acted = false;
		let useTerminal = false;
		let useLootBox = false;
		let tX;
		let tY;
		let lX;
		let lY;

		// if(!this.player.isAlive()){
		// 	//game should have ended
		// 	return;
		// }
		//console.log("onKeyUp");
		//console.log(player);
		//console.log(this.player);

		//console.log("Player x: ", player.x, "Player y: ", player.y);

		if(!player.isUsingTerminal && !player.isUsingLoot && !player.isViewingHelp && !enemyTurn){ //player cannot move while using terminal
			//THEY MOVE AFTER CHOOSING LOG OFF
			switch(event.keyCode){
				case Phaser.Keyboard.LEFT:
					//console.log("LEFT");
					//console.log("mX: ", player.x, "mY:", player.y-1);
					if(validMove(player.x, player.y-1, true)){
						//console.log("valid move");
						acted = moveTo(player, 0, {x: 0, y: -1});
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
						// else if(map[player.x][player.y] == Tile.TERMINAL){
						// 	useTerminal = true;
						// 	tX = player.x;
						// 	tY = player.y;
						// }
						// else if(map[player.x][player.y] == Tile.LOOT){
						// 	useLootBox = true;
						// 	lX = player.x;
						// 	lY = player.y;
						// }
					}
					else if(map[player.x][player.y-1] == Tile.TERMINAL){
						useTerminal = true;
						tX = player.x;
						tY = player.y-1;
						player.ap-=1;
						acted = true;
					}
					else if(map[player.x][player.y-1] == Tile.LOOT){
						useLootBox = true;
						lX = player.x;
						lY = player.y-1;
						acted = true;
					}
					break;
				case Phaser.Keyboard.UP:
					//console.log("UP");
					//console.log("mX: ", player.x-1, "mY:", player.y);
					if(validMove(player.x-1, player.y, true)){
						//console.log("valid move");
						acted = moveTo(player, 0, {x: -1, y: 0});
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
						// else if(map[player.x][player.y] == Tile.TERMINAL){
						// 	useTerminal = true;
						// 	tX = player.x;
						// 	tY = player.y;
						// }
						// else if(map[player.x][player.y] == Tile.LOOT){
						// 	useLootBox = true;
						// 	lX = player.x;
						// 	lY = player.y;
						// }
					}
					else if(map[player.x-1][player.y] == Tile.TERMINAL){
						useTerminal = true;
						tX = player.x-1;
						tY = player.y;
						acted = true;
					}
					else if(map[player.x-1][player.y] == Tile.LOOT){
						useLootBox = true;
						lX = player.x-1;
						lY = player.y;
						acted = true;
					}
					break;
				case Phaser.Keyboard.RIGHT:
					//console.log("RIGHT");
					//console.log("mX: ", player.x, "mY:", player.y+1);
					if(validMove(player.x, player.y+1, true)){
						//console.log("valid move");
						acted = moveTo(player, 0, {x: 0, y: 1});
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
						// else if(map[player.x][player.y] == Tile.TERMINAL){
						// 	useTerminal = true;
						// 	tX = player.x;
						// 	tY = player.y;
						// }
						// else if(map[player.x][player.y] == Tile.LOOT){
						// 	useLootBox = true;
						// 	lX = player.x;
						// 	lY = player.y;
						// }
					}
					else if(map[player.x][player.y+1] == Tile.TERMINAL){
						useTerminal = true;
						tX = player.x;
						tY = player.y+1;
						acted = true;
					}
					else if(map[player.x][player.y+1] == Tile.LOOT){
						useLootBox = true;
						lX = player.x;
						lY = player.y+1;
						acted = true;
					}
					break;
				case Phaser.Keyboard.DOWN:
					//console.log("DOWN");
					//console.log("mX: ", player.x+1, "mY:", player.y);
					if(validMove(player.x+1, player.y, true)){
						//console.log("valid move");
						acted = moveTo(player, 0, {x: +1, y: 0});
						if(map[player.x][player.y] == Tile.EXIT){
							showFloorSelectScreen();
						}
						// else if(map[player.x][player.y] == Tile.TERMINAL){
						// 	useTerminal = true;
						// 	tX = player.x;
						// 	tY = player.y;
						// }
						// else if(map[player.x][player.y] == Tile.LOOT){
						// 	useLootBox = true;
						// 	lX = player.x;
						// 	lY = player.y;
						// }
					}
					else if(map[player.x+1][player.y] == Tile.TERMINAL){
						useTerminal = true;
						tX = player.x+1;
						tY = player.y;
						acted = true;
					}
					else if(map[player.x+1][player.y] == Tile.LOOT){
						useLootBox = true;
						lX = player.x+1;
						lY = player.y;
						acted = true;
					}
					break;
				case Phaser.Keyboard.M:
					console.log(JSON.stringify(map));
					break;
				default: 
					break;
			}
		}

		//console.log("AP: " + player.ap);

		//display terminal for usage
		if(useTerminal){
			console.log("using terminal");
			let terminalIndex = terminalPositions.indexOf(tY + "_" + tX);
			let terminal = terminalList[terminalIndex];
			terminal.displayTerminal();
			hud.updateReadout("I should be able to hack this terminal.");
			// while(terminalUsed != true){
			// 	console.log("waiting for player to finished with terminal");
			// }
			//counts as an action, can deduct ap once they choose option
		}
		else if(useLootBox){
			console.log("opening loot box");
			console.log(lootPositions);
			let lootIndex = lootPositions.indexOf(lY + "_" + lX);
			let lootBox = lootList[lootIndex];
			console.log("lY: " + lY);
			console.log("lX: " + lX);
			console.log(lootBox);
			lootBox.displayLoot();
			let openContainer = game.add.audio('openContainer', 0.5);
			openContainer.play();
			hud.updateReadout("Maybe there is something I can use in here..");
		}

		//reduce ap as acted
		if(acted){
			player.ap -= 1;
			hud.updateAP();
			//UPDATE HUD
		}

		//player has ended turn (used up all ap), now time for enemies to act
		if(Math.floor(player.ap) <= 0){
			//console.log("AI TURN, AP: " + player.ap);
			//AI TURN
			//disable player movement
			enemyTurn = true;
			for(let i = 1; i < actorList.length; i++){
				let e = actorList[i];
				if(e.isAlive){
					while(e.ap > 0){
						aiAct(e, i);
						e.ap--;
					}
					e.ap = e.maxAP;
					//enemies should have ap also
					//basics have 1
				}
			}
			//AP UP AUG
			let aug = player.augmentations.find(function(a){return a.type == Aug.APUP;});
			let extraAP = false;
			if(aug != undefined){
				let chanceToGainAP = 100*(aug.effectVal*aug.level);
				console.log("chance: " + chanceToGainAP)
				let diceRoll = Math.ceil(Math.random() * 100);
				console.log("dice: " + diceRoll)
				if(diceRoll <= chanceToGainAP){
					player.ap = player.maxAP+1;
					extraAP = true;
					hud.updateReadout("I have gained the initiative.");
					let APupSound = game.add.audio('APup', 0.05).play();
				}
			}

			if(!extraAP){
				player.ap = player.maxAP;
			}
			
			hud.updateAP();
			//update HUD
			enemyTurn = false;
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
	update: function(){
		//this.game.camera.focusOnXY(player.sprite.x, player.sprite.y-100);
		if(!gameOver){
			if(player.hp <= player.maxHP*0.2){
				if(!heartbeat.isPlaying){
					console.log("play heartbeat");
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
			heartbeat.stop();
		}
	}
	/*gameOver: function(){}
	*/
};

//adds loot boxes to level that contains augs
function placeLoot(){
	//aug ideas:
	//Download (heal when dealing dmg)
	//Push() (chance to knockback (push back one tile)
	//ForEach (adjacent enemies)
	//CapacityUpgrade AP+1
	//HighRoll increased crit%
	//Stop() chance to stun enemy (set ap to 0)
	//Extend() range increase
	//TryCatch() increases def/evasion

	//when find lootbox, show loot screen:
	//you found <insert name>
	//<effects>
	//take || leave
	//if take, add to player augmentations list

	console.log("placing loot");

	let ranPos;

	//used?
	lootPositions = [];
	lootList = [];

	//3 have augs
	//2 have credits

	let a; //aug
	let c; //credits

	for(let l = 0; l < lootNumber; l++){
		//NEED TO NOT BLOCK DOORS + IDEALLY NOT PUT MORE THAN ONE IN A ROOM

		//SOME WEIRDNESS GOING ON. DOORS?
		console.log("Finding space for lootbox.");
		ranPos = getRandomCoords(rooms, false, true);
		c = Math.ceil(Math.random() * (150+(150 * Math.floor(floorNumber/2))));
		if(l < 2){
			a = null;
			c += 50 * floorNumber;
		}
		else{
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
		let loot = new LootBox(a, c, ranPos.y, ranPos.x);
		map[ranPos.y][ranPos.x] = Tile.LOOT;
		lootPositions.push(ranPos.x + '_' + ranPos.y); 
		lootList.push(loot);
		console.log("Loot " + l, loot);
		//console.log(terminal.options);
	}


	//can upgrade existing augs at terminals
	//can buy them also?

	//when attacking or moving (apply any augmentations to ap + dmg + effect)
}

function LootBox(aug, credits, x, y){
	this.sprite = game.add.sprite(y*64, x*64, 'safeTile'); 
	this.aug = aug;
	this.credits = credits;
	this.augText;
	this.creditText;
};

LootBox.prototype = {
	displayLoot: function(){
		player.isUsingLoot = true; //game pause

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
   			let thisAugType = this.aug.type;
   			let foundAug = player.augmentations.find(function(a){return a.type == thisAugType;});
	   		let existingString = "";
	   		let existingAug = false;

	   		if(foundAug){
	   			existingString = "  (+1 aug level)";
	   			existingAug = true;
	   		}

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
		item.fill = "#FF0000";
	},
	outOption: function(item){
		item.fill = "#19de65";
	},
	takeCredits : function(){
		player.credits += this.credits;
		creditsEarned += this.credits;
		hud.updateReadout("I found " + this.credits + " credits.");
		hud.updateCredits();
		this.credits = null;
		this.displayLoot();
	},
	takeAug : function(){
		player.augmentations.push(this.aug);
		hud.updateReadout("I found a new augmentation, this should help.");
		hud.updateAugs();
		this.aug = null;
		this.displayLoot();
	},
	upgradeAug : function(){
		let thisAugType = this.aug.type;
		let existingAug = player.augmentations.find(function(a){return a.type == thisAugType;});
		existingAug.level += 1;
		hud.updateReadout("My augmentation became more powerful.");
		hud.updateAugs();
		this.aug = null;
		this.displayLoot();
	}
};

var Aug = {
	VAMP: "Vampiric Siphoning",
	DEF: "Defensive Matrix",
	APUP: "Mobility Enhancer"
};

//generic object that 
function Augmentation(type, level, effectVal){
 	this.type = type;
 	this.level = level;
 	this.effectVal = effectVal;

 	//create augmentation:
 	//let a = new Vamp(); //Vamp is an Augmentation
 	//Vamp calls the Augmentation constructor with Aug.VAMP

 	//create augmentation:
 	//let a = new Augmentation(Aug.VAMP, 1); 
 	//then could do on attack:
 	//if augmentations[i].type = Aug.VAMP{
 			//on damage, heal player for vampAmount*augmentations[i].level
}

//initialises all elements of current floor
function setupFloor(fn, p){
	floorNumber = fn;
	healCost = 50+50*Math.floor(0.5*floorNumber);

	initMap();
	expandRandomRooms(); //also populates room adjacency lists
	// console.log("AFTER EXPAND:");
	// console.log(JSON.stringify(map));
	randomlyConnectAdjacentRooms(); //use room adjency list to add doors connecting the rooms
	// console.log("AFTER CONNECTIONS:");
	// console.log(JSON.stringify(map));
	if(fn < topFloor){
		placeExit();
	}
	drawFloor();
	placeTerminals();
	placeLoot(); //contain loot, credits or traps
	//placeFurniture(); blocks pathing, adds interest
	initActors(p);
	if(fn > 1){
		//hud = new HUD(game);
		hud.initHUD("A new floor.");
	}

	actorList.forEach(function(i){ console.log("x:", i.x, "y:", i.y); });
	actorPositions.forEach(function(i){ console.log(i); });
	//console.log(actorPositions);
	console.log(JSON.stringify(map));
}
//place an exit tile at a random point on perimiter wall
function placeExit(){
	//on an external wall
	//completely random, otherwise it's always far away
	//never in same room
	let ranWall;
	let exitY;
	let exitX;

	let validExitSpotFound = false;

	while(!validExitSpotFound){
		ranWall = Math.floor(Math.random()*4);

		switch(ranWall){
			case 0: 
				//left wall
				exitY = 0;
				exitX = Math.floor(Math.random()*mapSize);
				if(map[exitY+1][exitX] == Tile.FLOOR){
					validExitSpotFound = true;
				}
				break;
			case 1:
				//top wall
				exitY = Math.floor(Math.random()*mapSize);
				exitX = 0;
				if(map[exitY][exitX+1] == Tile.FLOOR){
					validExitSpotFound = true;
				}
				break;
			case 2:
				//right wall
				exitY = mapSize-1;
				exitX = Math.floor(Math.random()*mapSize);
				if(map[exitY-1][exitX] == Tile.FLOOR){
					validExitSpotFound = true;
				}
				break;
			case 3:
				//bot wall
				exitY = Math.floor(Math.random()*mapSize);
				exitX = mapSize-1;
				if(map[exitY][exitX-1] == Tile.FLOOR){
					validExitSpotFound = true;
				}
				break;
			default:
				break;
		}

	}

	// console.log(exitY);
	// console.log(exitX);

	//exitY = 1;
	//exitX = 0;

	// console.log("Exit at mapY: " + exitY + " and mapX: " + exitX);

	map[exitY][exitX] = Tile.EXIT;
}

//places terminals throughout the current floor, with rules for where they can be placed
function placeTerminals(){
	//placed along walls?
	//if next to a wall, should be rotated appropriately

	let ranPos;

	terminalPositions = [];
	terminalList = [];

	for(let t = 0; t < terminalNumber; t++){
		//NEED TO NOT BLOCK DOORS + IDEALLY NOT PUT MORE THAN ONE IN A ROOM
		console.log("Finding space for terminal.");
		ranPos = getRandomCoords(rooms, false, true);
		//not all terminals should have same options
		let options = ["Heal", "Upgrade Damage", "Upgrade HP", "Log Off"];
		let terminal = new Terminal(options, ranPos.y, ranPos.x, false)
		map[ranPos.y][ranPos.x] = Tile.TERMINAL;
		terminalPositions.push(ranPos.x + '_' + ranPos.y); 
		terminalList.push(terminal);
		//console.log(terminal.options);
	}

	if(floorNumber == topFloor){
		console.log("FINAL FLOOR");
		ranPos = getRandomCoords(rooms, false, true);

		//for quicker debugging
		//ranPos.x = 3;
		//ranPos.y = 3;

		let options = ["UPLOAD VIRUS", "Log Off"];
		let terminal = new Terminal(options, ranPos.y, ranPos.x, true)
		map[ranPos.y][ranPos.x] = Tile.TERMINAL;
		terminalPositions.push(ranPos.x + '_' + ranPos.y); 
		terminalList.push(terminal);
	}
}

function drawFloor(){
	//looks through map, creates sprites for all elements (exit, terminals, doors, walls, floor)
	//GROUPS?
	//do I even need tilemap?

	//EVEN USING GROUPS?
	blockLayer = game.add.group();
	floorLayer = game.add.group();
	objLayer = game.add.group();

	//DEF NEEDED TO ADD FOG OF WAR TO UNEXPLORED ROOMS

	for(let x = 0 ; x < mapSize; x++){
		for(let y = 0; y< mapSize; y++){
			if(map[x][y] == Tile.FLOOR){
				//floorLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'floorTile'));
				let floor = floorLayer.create(y*64, x*64, 'floorTile');
				//console.log("floor tile added");
			}
			else if(map[x][y] == Tile.WALL){
				//objLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'wallTile'));
				let wall = blockLayer.create(y*64, x*64, 'wallTile');
				//console.log("wall tile added");
			}
			else if(map[x][y] == Tile.DOOR){
				//objLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'doorTile'));
				let floor = floorLayer.create(y*64, x*64, 'floorTile');
				// let door = objLayer.create(y*64, x*64, 'doorTile');
				// if(map[x][y+1]==Tile.WALL){
				//  	door.anchor.setTo(0.5, 0.5);
				//  	//door.pivot.x = door.width * .5;
				//  	//door.pivot.y = door.height * .5;
				//  	door.angle+=180;
				//  	//door.anchor.y = 0.5 ;
				// }
				//console.log("door tile added");
			}
			else if(map[x][y] == Tile.EXIT){
				//objLayer.addChild(tMap.game.add.sprite(x*32, y*32, 'doorTile'));
				let exit = objLayer.create(y*64, x*64, 'exitTile');
				//console.log("door tile added");
			}

		}
	}
	console.log(JSON.stringify(map));
}

//creates the player and enemy characters, with rules dictating placement
function initActors(p){
	//pass existing values to new player or keep existing player and change sprite location?
	//all enemies should be removed and new ones added
	//strength and number of enemies depends on level
	//should not place actors within x range of each other
	//ACTOR INITIALISATION SHOULD BE IN A METHOD
	actorPositions = [];
	actorList = [];

	let ranPos = getRandomCoords(rooms, true, false);

	//for quicker debugging
	//ranPos.x = 2;
	//ranPos.y = 2;

	if(p == undefined){
		console.log("p is undefined");
		playerName = localStorage.getItem("playerName");
		player = new Player(game, playerName, ranPos.y, ranPos.x, 100);
	}
	else{
		//this is madness
		console.log("p is existing");
		p.ap = p.maxAP;
		player.x = ranPos.y;
		player.y = ranPos.x;
		player.sprite.kill();
		player.sprite = game.add.sprite(player.y*64, player.x*64, 'player', 19); 
	}

	player.sprite.animations.add('walkLeft', [9, 10, 11, 12, 13, 14, 15, 16, 17], 18, false);
	player.sprite.animations.add('walkUp', [0, 1, 2, 3, 4, 5, 6, 7, 8], 18, false);
	player.sprite.animations.add('walkRight', [27, 28, 29, 30, 31, 32, 33, 34, 35], 18, false);
	player.sprite.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 24, 25, 26], 18, false);
	player.sprite.anchor.y = 0.3 ;

	actorPositions.push(ranPos.y + '_' + ranPos.x); 
	actorList.push(player);


	// // ////////////////////////
	// // //for quick debug
	// if(floorNumber == 1){
	// 	player.augmentations.push(new Augmentation(Aug.VAMP, 1, 0.05));
	//player.augmentations.push(new Augmentation(Aug.APUP, 10, 0.1));
	// 	player.augmentations.push(new Augmentation(Aug.DEF, 1, 0.1));
	// }
	// // console.log(player.augmentations);
	// // ////////////////////////////

	game.physics.enable(player.sprite, Phaser.Physics.ARCADE);

	//needs offset
	game.camera.follow(player.sprite);
	console.log(player.x, player.y);
	console.log(game.camera.x, game.camera.y);
	//game.camera.focusOnXY(player.y*64, player.x*64);
	let awayFromPlayer;
	let distX;
	let distY;
	//change dmg and hp based on floorNumber
	//change proportion of better ai enemies
	for(let e = 0; e < numEnemies; e++){
		awayFromPlayer = false;
		distX = 0;
		distY = 0;
		while(!awayFromPlayer){
			console.log("checking if near player");
			ranPos = getRandomCoords(rooms, true, false);
			distX = Math.abs(player.y - ranPos.x);
			distY = Math.abs(player.x - ranPos.y);
			if(distX >= 3 || distY >= 3){
				awayFromPlayer = true;
			}
		}
		let enemy;
		let ratio = enemyRatios[floorNumber - 1];
		if(e < numEnemies*ratio.e1){
			enemy = new Enemy(game, ranPos.y, ranPos.x, 50+(50*ratio.buff), 1, 20+(30*ratio.buff), 'armor1', 1);
		}
		else if(e < numEnemies*ratio.e1 + numEnemies*ratio.e2){
			enemy = new Enemy(game, ranPos.y, ranPos.x, 100+(100*ratio.buff), 1, 20+(30*ratio.buff),'armor2', 2);
		}
		else if(e < numEnemies*ratio.e1 + numEnemies*ratio.e2 + numEnemies*ratio.e3){
			enemy = new Enemy(game, ranPos.y, ranPos.x, 65+(65*ratio.buff), 2, 20+(20*ratio.buff), 'agent', 3);
		}

		// //ratio of enemy types
		// if(e < numEnemies/2){
			
		// }
		// else{
		// 	let rndEnemy = Math.floor(Math.random() * 2);
		// 	if(rndEnemy = 0){
		// 		enemy = new Enemy(game, ranPos.y, ranPos.x, 100, 1, 'armor2', 2);
		// 	}
		// 	else{
		// 		enemy = new Enemy(game, ranPos.y, ranPos.x, 65, 2, 'agent', 3);
		// 	}
		// }
		
		actorList.push(enemy);
		actorPositions.push(ranPos.y + '_' + ranPos.x);//not sure which way around

		enemy.sprite.animations.add('walkLeft', [9, 10, 11, 12, 13, 14, 15, 16, 17], 60, false);
		enemy.sprite.animations.add('walkUp', [0, 1, 2, 3, 4, 5, 6, 7, 8], 60, false);
		enemy.sprite.animations.add('walkRight', [27, 28, 29, 30, 31, 32, 33, 34, 35], 60, false);
		enemy.sprite.animations.add('walkDown', [18, 19, 20, 21, 22, 23, 24, 25, 26], 60, false);
		enemy.sprite.anchor.y = 0.3 ;
	}

	console.log("Actor number:", actorList.length);
}
	
function HUD(game){//, messages, name, hp, ap, credits, floor, weapon, equipment){
	this.game = game;
	this.hudReadout = [];// = messages;
	this.leftOffset;
	this.readout0;
	this.readout1;
	this.readout2;
	this.readout3;
	this.hudNameText;// = name;
	this.hudNameVal;
	this.hudLevelText;
	this.hudLevelVal;
	this.hudExpText;
	this.hudExpVal;
	this.hudExpBar;
	this.hudHpText;
	this.hudHpValue;
	this.hudCurrentHpBar;// = hp;
	this.hudMaxHpBar;
	this.hudApText;
	this.hudApBar;// = ap;
	//this.hudDmgText;
	this.hudCredits;// = credits;
	// this.hudFloor;// = floor;
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
		console.log("INIT HUD");

		this.leftOffset = this.game.width/2-30;
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0x222222);
	   	graphics.lineStyle(1, 0x444444, 1);
	   	let hudBackground = graphics.drawRect(-1, this.game.height-100, this.game.width+1, 100);
	   	hudBackground.fixedToCamera = true;
	   	graphics.endFill();

	   	//console.log(this.game.height);
	   	//console.log(this.game.width);

	   	this.updateReadout(message);
	   	this.updateName();
	   	this.updateLevel();
	   	this.updateEXP();
	   	this.updateHP();
	   	this.updateAP();
	   	this.updateDMG();
	   	this.updateCredits();
	   	//this.updateFloor();
	   	this.updateAugs();
	   	this.addHelp();
	},
	updateName(){
		if(this.hudNameText != null){
			this.hudNameText.destroy();
			this.hudNameVal.destroy();
		}

		var style = {font: "12px Consolas", fill: "#fff", align: "left"};

		// this.hudNameText = this.game.add.text(this.game.width/2, this.game.height-90, "Name: ", style);
		// this.hudNameText.fixedToCamera = true;

		this.hudNameVal = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-90), player.name, style);
		this.hudNameVal.fixedToCamera = true;
	},
	updateLevel(){
		if(this.hudLevelText != null){
			this.hudLevelText.destroy();
			this.hudLevelVal.destroy();
		}

		var style = {font: "12px Consolas", fill: "#fff", align: "left"};

		this.hudLevelText = this.game.add.text(Math.floor(this.leftOffset+80), Math.floor(this.game.height-90), "Lv:", style);
		this.hudLevelText.fixedToCamera = true;

		this.hudLevelVal = this.game.add.text(Math.floor(this.leftOffset+100), Math.floor(this.game.height-90), " " + player.lvl, style);
		this.hudLevelVal.fixedToCamera = true;

	},
	updateEXP(){
		// //two bars like health
		console.log("updateEXP");
		console.log("leftOffset: ", this.leftOffset);

		if(this.hudExpText != null){
			this.hudExpText.destroy();
			this.hudExpValue.destroy();
			this.hudExpBar.destroy();
		}

		var style = {font: "12px Consolas", fill: "#fff", align: "left"};

		this.hudExpText = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-36), "EXP: ", style);
		this.hudExpText.fixedToCamera = true;

		// //does this do anything???
		// if(this.hudHpBar != null){
		// 	this.hudHpBar.destroy();
		// }

		// //ADD RED RECTANGLE OF CERTAIN WIDTH, FIXED HEIGHT
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0xAA00AA);
	   	//graphics.lineStyle(1, 0x880000, 1);
	   	this.hudExpBar = graphics.drawRect(this.leftOffset+30, this.game.height-34, (player.exp/expThreshold*100), 10);
	   	this.hudExpBar.fixedToCamera = true;
	   	graphics.endFill();

	   	var style = {font: "12px Consolas", fill: "#fff", align: "left"};

		this.hudExpValue = this.game.add.text(Math.floor(this.leftOffset+34), Math.floor(this.game.height-36), player.exp + "/" + expThreshold, style);
		this.hudExpValue.fixedToCamera = true;

		// graphics.beginFill(0xAA0000);
		// //console.log(player.hp);
		// //console.log(player.maxHP);
		// this.hudMaxHpBar = graphics.drawRect(this.game.width/2+30+player.hp, this.game.height-70, player.maxHP - player.hp, 10);
	 //   	this.hudMaxHpBar.fixedToCamera = true;
	 //   	graphics.endFill();
	},
	updateReadout: function(message){
		//IF SPACE IN READOUTS AREA, ADD NEW MESSAGE TO TOP, SHIFT ALL DOWN (USE UNSHIFT?)
		//IF NOT SPACE, POP LAST ONE/s, ADD NEW ONES

		if(message != null){
			if(this.hudReadout.length < 4){
				this.hudReadout.unshift(message);
			}
			else{
				this.hudReadout.pop();
				this.hudReadout.unshift(message);
			}
		}

		//console.log(this.hudReadout);

		var style = {font: "12px Consolas", fill: "#ffffff", align: "left"};
	
		let readoutY = this.game.height-81;
		let r;

		//console.log("y:", y)

		//console.log(this.readout0);

		if(this.readout0 != null){
			//console.log("existing readout0 destroyed");
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
				this.readout0 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout0.fixedToCamera = true;
			}
			else if(m == 1){
				//r = this.readout1;
				this.readout1 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout1.fixedToCamera = true;
			}
			else if(m == 2){
				//r = this.readout2;
				this.readout2 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout2.fixedToCamera = true;
			} 
			else if(m == 3){
				//r = this.readout3;
				this.readout3 = this.game.add.text(Math.floor(50), Math.floor(readoutY), this.hudReadout[m], style);
				this.readout3.fixedToCamera = true;
			} 
			//console.log(this.hudReadout[m]);
			readoutY += 18;
		}
	},
	// updateName: function(name){
	// 	var style = {font: "12px Consolas", fill: "#fff", align: "left"};

	// 	this.hudName = this.game.add.text(this.game.width/2, this.game.height-90, "Name: " + playerName, style);
	// 	//t.anchor.set(0.5);
	// 	this.hudName.fixedToCamera = true;
	// },
	updateHP: function(){
		if(this.hudHpText != null){
			this.hudHpText.destroy();
			this.hudHpValue.destroy();
		}

		var style = {font: "12px Consolas", fill: "#fff", align: "left"};

		this.hudHpText = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-72), "HP: ", style);
		this.hudHpText.fixedToCamera = true;

		//does this do anything???
		if(this.hudHpBar != null){
			this.hudHpBar.destroy();
		}

		//ADD RED RECTANGLE OF CERTAIN WIDTH, FIXED HEIGHT
		let graphics = this.game.add.graphics(0, 0);

		graphics.beginFill(0xFF0000);
	   	//graphics.lineStyle(1, 0x880000, 1);
	   	this.hudCurrentHpBar = graphics.drawRect(Math.floor(this.leftOffset+30), Math.floor(this.game.height-70), player.hp, 10);
	   	this.hudCurrentHpBar.fixedToCamera = true;
		graphics.beginFill(0xAA0000);
		//console.log(player.hp);
		//console.log(player.maxHP);
		this.hudMaxHpBar = graphics.drawRect(Math.floor(this.leftOffset+30+player.hp), Math.floor(this.game.height-70), player.maxHP - player.hp, 10);
	   	this.hudMaxHpBar.fixedToCamera = true;
	   	graphics.endFill();

	   	this.hudHpValue = this.game.add.text(Math.floor(this.leftOffset+33), Math.floor(this.game.height-72), Math.ceil(player.hp) + "/" + player.maxHP, style);
		this.hudHpValue.fixedToCamera = true;

		//this.hudHP = this.game.add.text((this.game.width/2), this.game.height-72, "HP: " + player.hp, style);
		//t.anchor.set(0.5);
		//this.hudHpBar.fixedToCamera = true;
	},
	updateAP: function(){
		if(this.hudApText != null){
			this.hudApText.destroy();
		}

		var style = {font: "12px Consolas", fill: "#fff", align: "left"};
		this.hudApText = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-54), "AP: ", style);
		this.hudApText.fixedToCamera = true;
		//change to x number of images, hide when ap is used, show again once ap is regained
		
		if(this.hudApBar != null){
			this.hudApBar.destroy();
		}

		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xFF9900);

		let x = this.leftOffset+30;

		for(let a = 0; a < player.ap; a++){
			this.hudApBar = graphics.drawRect(x, this.game.height-52, 20, 10);
			x += 25;
		}

	 	//graphics.lineStyle(1, 0x880000, 1);
	 	
	   	this.hudApBar.fixedToCamera = true;
	   	graphics.endFill();
		
		//this.hudAP = this.game.add.text((this.game.width/2), this.game.height-54, "AP: " + player.ap, style);
		//t.anchor.set(0.5);
		//this.hudAP.fixedToCamera = true;
	},
	updateDMG: function(){
		if(this.hudDmgText != null){
			this.hudDmgText.destroy();
		}

		var style = {font: "12px Consolas", fill: "#fff", align: "left"};

		this.hudDmgText = this.game.add.text(Math.floor(this.leftOffset+120), Math.floor(this.game.height-90), "Dmg: " + player.dmg, style);
		this.hudDmgText.fixedToCamera = true;
	},
	updateCredits: function(){
		var style = {font: "12px Consolas", fill: "#fff", align: "left"};

		console.log("updateCredits");
		console.log("leftOffset: ", this.leftOffset);

		if(this.hudCredits != null){
			this.hudCredits.destroy();
		}

		this.hudCredits = this.game.add.text(Math.floor(this.leftOffset), Math.floor(this.game.height-16), "Credits: " + player.credits, style);
		//t.anchor.set(0.5);
		this.hudCredits.fixedToCamera = true;
	},
	// updateFloor: function(){
	// 	var style = {font: "12px Consolas", fill: "#fff", align: "left"};

	// 	if(this.hudFloor != null){
	// 		this.hudFloor.destroy();
	// 	}

	// 	this.hudFloor = this.game.add.text((this.game.width/2), this.game.height-18, "Floor " + floorNumber + " of " + topFloor, style);
	// 	//t.anchor.set(0.5);
	// 	this.hudFloor.fixedToCamera = true;
	// },
	updateAugs: function(){
		//if(this.hudAugList == undefined){ this.hudAugList = augs;};

		// if(this.hudAugList != null){

		// }

		if(this.hudAugTextGroup != null){
			this.hudAugTextGroup.destroy();
		}

		if(this.hudAugList != undefined){
			this.hudAugList.splice(0, this.hudAugList.length);
		}
		else{
			this.hudAugList = [];
		}

		//this.hudAugList = [];
		
		//console.log(this.hudAugList);
		//console.log(player.augmentations);

		for(let i = 0; i < player.augmentations.length; i++){
			//should not be any duplicates
			//console.log("augs length", player.augmentations.length)
			//console.log(player.augmentations[i]);
			this.hudAugList.push({type: player.augmentations[i].type, level: player.augmentations[i].level});
			console.log(this.hudAugList);
		}
		
		var style = {font: "12px Consolas", fill: "#fff", align: "left"};

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

		let a;
		let augEffect;
		let typeString;
		
		for(let i = 0; i < player.augmentations.length; i++){
			let a = player.augmentations[i];
			// console.log(a);
			// console.log(a.type);

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
			console.log(a.type);
			//r = this.readout3;
			
			let aText = this.game.add.text(Math.floor(game.width-300), Math.floor(augY), "lv." + a.level + " " + typeString + " " + augEffect, style, this.augTextGroup);
			aText.fixedToCamera = true;
			//aText.anchor.set(0.5);
			//console.log(this.hudReadout[m]);
			augY += 18;
		}
	},
	addHelp: function(){
		if(this.hudHelpButton != null){
			console.log("Destroy help button");
			this.hudHelpButton.destroy();
			this.hudHelpText.destroy();
		}

		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0x222222);
	   	graphics.lineStyle(1, 0x444444, 1);
	   	this.hudHelpButton = graphics.drawRect(15, 15, 30, 30);
	   	this.hudHelpButton.fixedToCamera = true;
	   	
	   	graphics.endFill();


	   	if(player.isViewingHelp){
	    	this.hudHelpButton.inputEnabled = false;
	    	console.log("player IS viewing help");
	    } 
	    else{
	    	this.hudHelpButton.inputEnabled = true;
	    	console.log("player NOT viewing help");
	    }

	   	this.hudHelpButton.events.onInputUp.add(this.showHelp, this);
	   	this.hudHelpButton.events.onInputOver.add(function(){ this.hudHelpText.fill = "#ff0000";}, this);
	    this.hudHelpButton.events.onInputOut.add(function(){ this.hudHelpText.fill = "#fff";}, this);

	   	let style = {font: "24px Consolas", fill: "#fff", align: "left"};
	   	this.hudHelpText = this.game.add.text(Math.floor(22), Math.floor(19), "?", style);
	   	this.hudHelpText.fixedToCamera = true;
	   	
	},
	showHelp: function(){
		console.log("show help, playerisViewingHelp=" + player.isViewingHelp);
		this.hudHelpButton.inputEnabled = false;
		this.hudHelpText.fill = "#fff";
		player.isViewingHelp = true;

		let graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0x222222);
	   	graphics.lineStyle(1, 0x444444, 1);
	    this.helpBackground = graphics.drawRect(this.game.width/4, this.game.height/4, this.game.width/2, this.game.height/2);
	   	this.helpBackground.fixedToCamera = true;
	   	graphics.endFill();

		this.helpTextGroup = this.game.add.group();

		let helpTitle = this.game.add.text(Math.floor(this.game.width/2), Math.floor(this.game.height/4), "Help", titleStyle, this.helpTextGroup);
	   	helpTitle.fixedToCamera = true;

	   	let leftHelpOffset = this.game.width/4+10;
	  	
	  	//CONTROLS
	  	let controlsTitleTopOffset = this.game.height/4+20;
		let controlsTitle = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(controlsTitleTopOffset), "Controls", titleStyle, this.helpTextGroup);
	   	controlsTitle.fixedToCamera = true;
	   	let controls1 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(controlsTitleTopOffset+30), "Arrows keys: player movement/use object/attack enemy", mainTextStyle, this.helpTextGroup);
	   	controls1.fixedToCamera = true;
	   	let controls2 = this.game.add.text(Math.floor(leftHelpOffset), Math.floor(controlsTitleTopOffset+50), "Left mouse button: player movement/use object/attack enemy", mainTextStyle, this.helpTextGroup);
	   	controls2.fixedToCamera = true;

	   	//HUD
	   	let hudExplanationTitleTopOffset = this.game.height/4+100;
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
		let hudPlayTitleTopOffset = this.game.height/4+200;
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
	   		this.hudHelpButton.inputEnabled = true;
	   		player.isViewingHelp = false;
	   	}, this);
	   	this.closeHelpText.fixedToCamera = true;
	    this.closeHelpText.events.onInputOver.add(function(item){ item.fill = "#ff0000";}, this);
	    this.closeHelpText.events.onInputOut.add(function(item){ item.fill = "#fff";}, this);
	}
};

function aiAct(e, index){

	let dx = e.x - player.x;
	let dy = e.y - player.y;

	//NEED TO CHECK FOR WALLS THAT WOULD OBSCURE SIGHT

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
			if(dy > 0){
				//check valid move in one direction, if not valid, 
				if(validMove(e.x, e.y -1, false)){
					posX = 0;
					posY = -1;
				}
				else{
					posX = 1;
					posY = 0;
				}

				// rndChoice = Math.floor(Math.random() * 2);
				// if(rndChoice == 0){
				// 	posX = 0;
				// 	posY = -1;
				// }
				// else{
				// 	posX = 1;
				// 	posY = 0;
				// }
			}
			else if(dy < 0){
				if(validMove(e.x, e.y + 1, false)){
					posX = 0;
					posY = 1;
				}
				else{
					posX = 1;
					posY = 0;
				}

				// rndChoice = Math.floor(Math.random() * 2);
				// if(rndChoice == 0){
				// 	posX = 0;
				// 	posY = 1;
				// }
				// else{
				// 	posX = 1;
				// 	posY = 0;
				// }
			}
			else if(dy == 0){
				posX = 1;
				posY = 0;
			}
		}
		else if(dx > 0){ //player is above
			if(dy > 0){
				if(validMove(e.x, e.y -1, false)){
					posX = 0;
					posY = -1;
				}
				else{
					posX = -1;
					posY = 0;
				}

				// rndChoice = Math.floor(Math.random() * 2);
				// if(rndChoice == 0){
				// 	posX = 0;
				// 	posY = -1;
				// }
				// else{
				// 	posX = -1;
				// 	posY = 0;
				// }
			}
			else if(dy < 0){
				if(validMove(e.x, e.y + 1, false)){
					posX = 0;
					posY = 1;
				}
				else{
					posX = -1;
					posY = 0;
				}

				// rndChoice = Math.floor(Math.random() * 2);
				// if(rndChoice == 0){
				// 	posX = 0;
				// 	posY = 1;
				// }
				// else{
				// 	posX = -1;
				// 	posY = 0;
				// }
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

	//CAUSING ISSUES?
	//console.log("EnemyX: " + e.x + " PlayerX: " + player.x);
	//console.log("EnemyY: " + e.y + " PlayerY: " + player.y);
	if(validMove(e.x + posX, e.y + posY, false)){
		moveTo(e, index, {x: posX, y: posY});
	}
	// else{
	// 	aiAct(e, index);
	// }
};

//finds a valid cell to place objects, based on rules for each object type
function getRandomCoords(rooms, actor, object){
	
	let emptyCell = false;	
	let rndRoom;
	let rndRoomX;
	let rndRoomY;

	//NEED TO HAVE SOME WAY OF CHECKING FOR OTHER ACTORS/OBJECTS SO DON'T PLACE ON THEM
	while(!emptyCell){
		rndRoom = rooms[Math.floor(Math.random() * rooms.length)];
		//so that it works temporarily

		rndRoomX = rndRoom.tiles[0][Math.floor(Math.random() * rndRoom.tiles[0].length)].x;
		rndRoomY = rndRoom.tiles[Math.floor(Math.random() * rndRoom.tiles.length)][0].y;
		if(map[rndRoomY][rndRoomX] == Tile.FLOOR){
			if(actor && actorPositions.indexOf(rndRoomX + "_" + rndRoomY) == -1){
					emptyCell = true;
					// console.log("actorPositions before: " + actorPositions);
					// console.log("Actor to be placed at " + rndRoomX + "_" + rndRoomY);
			}
			else if(object){	
				let validObjectPosition = objectAreaCheck(rndRoomY, rndRoomX);
				if(validObjectPosition){
					emptyCell = true;
				}
			}
			// else{
			// 	emptyCell = true;
			// }
		}
	}
	
	//console.log("rndRoomX", rndRoomX);
	//console.log("rndRoomY", rndRoomY);

	//this may the issue
	return {x: rndRoomX, y: rndRoomY};
};

function objectAreaCheck(y, x){
	//let wallCount = 0;
	let doorFound = false;
	//let validPosition;

	//checks surrounding cells for wall tiles and door tiles
	//this is to avoid blocking doors with objects and from putting

	// if(map[y-1][x-1] == Tile.WALL){
	// 	wallCount++;
	// }

	// if(map[y-1][x] == Tile.WALL){
	// 	wallCount++;
	// }
	// else if(map[y-1][x] == Tile.DOOR){
	// 	doorFound = true;
	// }

	// if(map[y-1][x+2] == Tile.WALL){
	// 	wallCount++;
	// }

	// if(map[y][x-1] == Tile.WALL){
	// 	wallCount++;
	// }
	// else if(map[y][x-1] == Tile.DOOR){
	// 	doorFound = true;
	// }

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
		if(cellOccupied){
			//attacks and checks if they died, leaving space free to move into
			actor.sprite.frame = 10;
			actorKilled = attackActor(actor, actor.x, newPosY);
		}
		if(!actorKilled && !cellOccupied){
			actor.sprite.animations.play('walkLeft');
		}
	}
	else if(dir.x == -1 && dir.y == 0){
		newPosX -= 1;
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
	else if(dir.x == 0 && dir.y == 1){
		newPosY += 1;
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
	else if(dir.x == 1 && dir.y == 0){
		newPosX += 1;
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

	if(!cellOccupied){
		//only move sprite and change x and y position of actor
		//if cell is free to move into

		actorPositions[index] = newPosX + '_' + newPosY;

		//seems redundant to have multiple records of actor x and y
		actor.x = newPosX;
		actor.y = newPosY;
	
		//actor.sprite.y = newPosX*64;
		//actor.sprite.x = newPosY*64;

		Roguelike.game.add.tween(actor.sprite).to({x: newPosY*64, y: newPosX*64}, 250).start();


		// if(actor == player){
		// 	console.log("New position, x:" , newPosX , "and y:", newPosY);
		// }
	}

	/*if(actor==player){
		game.camera.focusOnXY(player.x*64, player.y*64);
	}*/

	return true;
};

function checkCellOccupied(x, y){
	//returns true if x and y are in the actorPositions list
	//ie an actor is at those coords
	// console.log("x:", x, "y:", y);
	// console.log(actorPositions.indexOf(x + "_" + y));
	// console.log(actorPositions);
	return actorPositions.indexOf(x + "_" + y) != -1;
};

function attackActor(aggressor, x, y){
	let victimIndex = actorPositions.indexOf(x + "_" + y);
	console.log("----------------");
	let victim = actorList[victimIndex];
	console.log("victim xy: " + victim.x + " " + victim.y);
	let victimDead = false;

	let playerDead = false;

	if(victim != player && aggressor != player){
		//do nothing, victim is friend 
	}
	else{
		//console.log(aggressor);
		//console.log(actorPositions[victimIndex]);
		if(victim == player){
			
			console.log("enemy xy" + aggressor.x + " " + aggressor.y);
			console.log("player xy" + victim.x + " " + victim.y);
			console.log("target xy" + x + " " + y)
			console.log("----------------");
			let aug = player.augmentations.find(function(a){return a.type == Aug.DEF;});
			let playerHit = true;
			if(aug != undefined){
				console.log("Def level: " + aug.level);
				let dodgeAmount = 100*(aug.effectVal*aug.level);
				let chanceToHit = 100-dodgeAmount;
				let diceRoll = Math.ceil(Math.random() * 100);
				console.log("Chance to hit: " + chanceToHit + "%");
				console.log("Rolled: " + diceRoll);
				playerHit = diceRoll <= chanceToHit; 
				//random number between 1 and 100
				//if that number is the same or under the chance to hit (of say 95) then deal dmg, otherwise player dodges
				//playerhit is false if missed
			}
			if(playerHit){
				let pHit = game.add.audio('playerHurt', 0.5);
				pHit.play();
				player.hp -= aggressor.dmg;
				hud.updateReadout("I took " + aggressor.dmg + " damage.");
				hud.updateHP();
			}
			else{
				let playerDodged = game.add.audio('miss', 0.3).play();
				hud.updateReadout("I dodged their attack.");
			}
		}
		else if(aggressor == player){
			console.log("player xy" + aggressor.x + " " + aggressor.y);
			console.log("enemy xy" + victim.x + " " + victim.y);
			console.log("target xy" + x + " " + y)
			console.log("----------------");
			// console.log(player.augmentations[0]);
			// console.log(aug);
			
			//check if attack hits
			let chanceToHitEnemy = 100-victim.dodgeChance;
			if(Math.floor(Math.random()*100) <= chanceToHitEnemy){
				let aug = player.augmentations.find(function(a){return a.type == Aug.VAMP;});
				if(aug != undefined){
					console.log("Vamp attack");
					if(player.hp < player.maxHP){
						player.hp += player.dmg*(aug.level * aug.effectVal); //5% vamp to begin with
						if(player.hp > player.maxHP){
							player.hp = player.maxHP;
							console.log("hp: " + player.hp + " maxHp: " + player.maxHP);
						}
						hud.updateHP();
					}
				}
				victim.hp -= aggressor.dmg;
				hud.updateReadout("I did " + aggressor.dmg + " damage to the enemy.");
				let hurtString;
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
				let enemyDodged = game.add.audio('miss', 0.3).play();
				hud.updateReadout("They dodged my attack!");
			}
		}

		console.log("victim HP: " + victim.hp);
		if(victim.hp <= 0){
			victimDead = true;
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
				player.score += victim.score;
				player.exp += victim.exp;
				hud.updateEXP();
				hud.updateReadout("Enemy killed. I found " + victim.credits + " credits on them.");
				if(player.exp >= expThreshold){
					//UPDATE HUD
					player.lvl++;
					player.maxHP += 5;
					player.hp+=5;
					player.dmg += 2;
					//player.maxAP += 0.5;
					//if max ap is now a full level higher, updateHUD

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
				//console.log("death sprite:", deathSprite.y, ",", deathSprite.x);
				//deathSprite.x;
				deathSprite.anchor.y = 0.3 ;
				deathSprite.animations.add(deathSprite, [0, 1, 2, 3, 4, 5], 18, false);
				deathSprite.animations.play(deathSprite);
				//hud.initHUD(); //hud covers corpses

				//victim.sprite = game.add.sprite(victim.y*64, victim.x*64, deathSprite, 0); 
				//victim.sprite.anchor.y = 0.3 ;
				//victim.sprite.animations.add(deathSprite, [0, 1, 2, 3, 4, 5], 18, false);
				//victim.sprite.animations.play(deathSprite);
				actorList.splice(victimIndex, 1);
				//actorList[victimIndex].isAlive = false;
				actorPositions.splice(victimIndex, 1);
				//numEnemies--;
				//console.log("Enemy Killed");
				enemiesKilled++;
			}
			// victim.sprite = game.add.sprite(player.y*64, player.x*64, 'armorDeath', 0); 
			// victim.sprite.animations.add('armorDeath', [0, 1, 2, 3, 4, 5], 18, false);
			// victim.sprite.animations.play('armorDeath');
			
			
			//victim.sprite.kill();

			//victim.sprite.kill();
		}
	}

	if(playerDead){
		showGameOverScreen("Defeat");

	}
	else{
		return victimDead;
	}
};

function showFloorSelectScreen(){

	let graphics = game.add.graphics(0, 0);

	graphics.beginFill(0x222222);
   	graphics.lineStyle(1, 0xffffff, 1);
   	let floorSelectBackground = graphics.drawRect(200, 100, game.width-400, game.height-300);
   	floorSelectBackground.fixedToCamera = true;
   	graphics.endFill();

   	let textGroup = game.add.group();

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
		setupFloor(++floorNumber, player); 
		//music.fadeOut(2000);
		// if(music.key == 'eCommerce'){
		// 	music = game.add.audio('Enthusiast', 0.2, true);
		// }
		// else{
		// 	music = game.add.audio('eCommerce', 0.2, true);
		// }
		// music.fadeIn(2000);
		console.log(floorNumber);
	}, this);
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

function showGameOverScreen(message){
	let gameOverColour = (message == "Victory") ? "#19de65" : "#FF0000";
	music.stop();
	gameOver = true;

	// if(heartbeat.isPlaying){
	// 	heartbeat.stop();
	// }

	if(message != "Victory"){
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

   	let gameOverText = message;
   	let statsText = "Stats";
   	let killedText = "Enemies Killed: " + enemiesKilled;
   	let scoreText = "Score: " + player.score;
   	let creditsText = "Credits earned: " + creditsEarned;
   	let levelText = "Level: " + player.lvl;
   	let floorsClearedText = (floorNumber == topFloor) ? "Floors cleared: " + topFloor :  "Floors cleared: " + --floorNumber;
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

	returnText = game.add.text(Math.floor(xOffset), Math.floor(yOffset+120), returnText, mainTextStyle, textGroup);
	returnText.fill = "#19de65";
	returnText.fixedToCamera = true;
	returnText.inputEnabled = true;
	returnText.anchor.x = 0.5;
	returnText.events.onInputDown.add(function(){
		textGroup.destroy(); 
		graphics.destroy(); 
		game.state.start('MainMenu');
		//title = document.getElementById("gametitle");
		//title.style.visibility = "hidden";
	}, this);
	returnText.events.onInputOver.add(function(){returnText.fill = "#FF0000";}, this);
	returnText.events.onInputOut.add(function(){returnText.fill = "#19de65";}, this);

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


function validMove(mX, mY, player){

	//THIS CAUSES ERRORS!
	//console.log("mx: " + mX + " my: " + mY);
	//console.log(map[mX][mY]);
	if(map[mX][mY] == Tile.WALL){
		//console.log("found wall");
		return false;
	}
	else if(map[mX][mY] == Tile.DOOR){
		//console.log("found door");
		//handle if door locked
	}
	else if(map[mX][mY] == Tile.EXIT){
		//console.log("found door");
		if(!player) return false;
		//handle if door locked
	}
	else if(map[mX][mY] == Tile.TERMINAL){
		return false;
	}
	else if(map[mX][mY] == Tile.LOOT){
		//console.log("Tile is loot xy: " + mX + " " + mY);
		return false;
	}
	else if(mX <= 0 || mY <= 0){
		//console.log("out of bounds");
		return false;
	}
		
	return true;
};

var Tile = {
	WALL: '#',
	FLOOR: '.',
	DOOR: 'D',
	EXIT: 'X',
	TERMINAL: 'T',
	LOOT: 'L'
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

function Terminal(options, x, y, final){
	this.options = options;
	this.sprite = (final) ? game.add.sprite(y*64, x*64, 'terminal2') : game.add.sprite(y*64, x*64, 'terminal1'); 
	this.graphics = null;
	this.textGroup = null;
	this.finalMainframe = final;
	this.terminalHum;
	this.terminalStart;
	//difficulty?
	//healPlayer
	//unlock room door
	//upgrade weapon/armor
	//
};

Terminal.prototype = {
	displayTerminal: function(){

		if(this.terminalHum == null){
			this.terminalHum = game.add.audio('terminalHum', 1.25);
		}
		else if(!this.terminalHum.isPlaying) this.terminalHum.play();

		//GAME SHOULD PAUSE DURING THIS SCREEN

		//https://phaser.io/examples/v2/text/display-text-word-by-word
		//http://phaser.io/examples/v2/input/button-open-popup

		player.isUsingTerminal = true; //game pause

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

	   	let yOffset = game.height/2;

		if(!this.finalMainframe){
			console.log(this.finalMainframe);
			
		   	let bootText = "Booting into P.R.A.S.H system, please wait";
		   	let fillerText = ".....";
		   	let welcomeText = "Welcome " + playerName + ", how may I help you today?";

		    this.textGroup = game.add.group();

		   	bootText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-150), bootText, { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
		   	bootText.fixedToCamera = true;
		   	bootText.anchor.x = 0.5;
		    if(this.terminalStart){	bootText.alpha = 0;}

		  	let fillerText1 = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-120), fillerText, { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
	   		fillerText1.fixedToCamera = true;
	   		fillerText1.anchor.x = 0.5;
	   		if(this.terminalStart){fillerText1.alpha = 0;}

	   		let fillerText2 = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-90), fillerText, { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
	   		fillerText2.fixedToCamera = true;
	   		fillerText2.anchor.x = 0.5;
	   		if(this.terminalStart){fillerText2.alpha = 0;}
	   		
	   		welcomeText = game.add.text(Math.floor(game.width/2), Math.floor(yOffset-60), welcomeText, { font: "15px Consolas", fill: "#19de65" }, this.textGroup);
	   		welcomeText.fixedToCamera = true;
	   		welcomeText.anchor.x = 0.5;
	   		if(this.terminalStart){welcomeText.alpha = 0;}

	   		// let costColor;//text should be red if cannot afford

	   		let purchaseStyle = { font: "15px Consolas", fill: "#19de65" };

	   		if(player.credits < healCost){
	   			purchaseStyle = { font: "15px Consolas", fill: "#FF0000" };
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
	   			purchaseStyle = { font: "15px Consolas", fill: "#FF0000" }
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
	   			purchaseStyle = { font: "15px Consolas", fill: "#FF0000" }
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
			hud.updateReadout("This must be the mainframe I've been looking for!");
			hud.updateReadout("Virus uploading...");
			//showVictoryScreen
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

		if(this.terminalStart){
			for(let i = 0; i < this.textGroup.length; i++){
				animations.push(game.add.tween(this.textGroup.children[i]).to({alpha: 1}, 1000, Phaser.Easing.Linear.None));	
				setTimeout(function(){
					animations[i].start();
				}, time+(i*100));
			}
		}
		
		// game.paused = true;
		// console.log("game paused");

		// while(player.isUsingTerminal){
		// 	console.log("console in use");
		// }
		// text = this.game.add.text(100, 120, this.options[1], { font: "15px Consolas", fill: "#19de65" });
		// text.fixedToCamera = true;
		// text = this.game.add.text(100, 140, this.options[2], { font: "15px Consolas", fill: "#19de65" });
		// text.fixedToCamera = true;
	},
	healPlayer: function(){
		console.log("Terminal heal");
		game.add.audio('mouseClick').play();
		if(player.hp == player.maxHP){
			hud.updateReadout("I'm already fully healed.");
		}
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
		console.log("Terminal upgrade damage");
		game.add.audio('mouseClick').play();
		if(player.credits >= upgradeDmgCost){
			player.credits -= upgradeDmgCost;
			hud.updateCredits();

			hud.updateReadout("I feel more powerful.");

			player.dmg += 5;
			hud.updateDMG();

			upgradeDmgCost *= 2;

			this.displayTerminal();
		}
		else{
			hud.updateReadout("I don't have enough credits.");
		}
		// check for enough credits
		// player.DMG += 20
	},
	upgradeHP: function(){
		console.log("Terminal health upgrade");
		game.add.audio('mouseClick').play();
		if(player.credits >= upgradeHpCost){
			player.credits -= upgradeHpCost;
			hud.updateCredits();

			hud.updateReadout("I feel healthier.");

			player.maxHP += 10;
			player.hp += 10;
			hud.updateHP();

			upgradeHpCost *= 2;

			this.displayTerminal();
		}
		else{
			hud.updateReadout("I don't have enough credits.");
		}
	},
	finalMainframeHack : function(){
		showGameOverScreen("Victory");
	},
	overOption: function(item, valid){
		if(valid){
			item.fill = "#FF0000";
		}
	},
	outOption: function(item, valid){
		if(valid){
			item.fill = "#19de65";
		}
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
	this.isUsingTerminal = false;
	this.isUsingLoot = false;
	this.isViewingHelp = false;
	this.augmentations = [];
};

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
		 	//console.log("checking for valid room");
		 	if(map[x][y] != Tile.FLOOR){
		 		validRoom = checkValidRoomSize(x, y);
		 		if(!validRoom){
		 			//attempt++;
		 			//console.log("Couldn't place with x: ", x, " and y: ", y);
		 			//try new random numbers
		 			x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
					y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		 		} 
		 	}
		 	else{
		 		//attempt++;
		 		//console.log("found floor tile while placing new room");
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
		//console.log("Room " + currentRoom + " with x:" + x + " y: " + y + " created.");
		
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
			//console.log("Cannot have walls around this space. x: " + x + " y: " + y);
		}
	}
	else{
			//console.log("Not enough floor space found. x: " + x + " y: " + y);
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
		//console.log("-------------------");
		//console.log("New room being placed");

		// console.log(rndRoomNum);
		// console.log(roomsToBePlaced[rndRoomNum]);
		//console.log("Rooms to be placed: ", roomsToBePlaced);

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
					//console.log("new random number: ", ran);
					//console.log("pool: ", adjacentRoomPool);
					//console.log("rndRoomNum: ", rndRoomNum);
				}
			}
		}
		
		let newRoom = roomsToBePlaced.find(function(room){ return room.id == rndRoomNum;})

		placedRooms.push(newRoom);

		roomsToBePlaced.splice(roomsToBePlaced.indexOf(newRoom),1);

		//console.log("Rooms to be placed: ", roomsToBePlaced);

		//console.log("New Room:");
		//console.log(newRoom);
		//console.log(newRoom.id);

		//console.log(newRoom);
		//console.log(newRoom.adjacentRooms);
		//console.log(newRoom.adjacentRooms.length);
		
		for(let i = 0; i < newRoom.adjacentRooms.length; i++){
			//only add if unique reference
			if(adjacentRoomPool.indexOf(newRoom.adjacentRooms[i]) == -1){
				adjacentRoomPool.push(newRoom.adjacentRooms[i]);
				//console.log(newRoom.adjacentRooms[i], "added to adjacentRoomPool.");
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
				//console.log("room.id: ",room.id);
				//console.log("connectionChoice.id: ", connectionChoice.id);
				return room.id == connectionChoice.id;
			})

			//console.log("Room To Connect:");
			//console.log(roomToConnect);
			//console.log(roomToConnect.id);

			//remove connection from pool as it has been picked
			adjacentRoomPool.splice(adjacentRoomPool.indexOf(roomToConnect.id), 1);
			adjacentRoomPool.splice(adjacentRoomPool.indexOf(newRoom.id), 1);

			//we have reference to first cell of adjacency, room.adjacentRooms[i].fX and fY
			//we have placedRooms array which contains both rooms (newRoom & roomToConnect)
			let adjacencyObj = newRoom.adjacentRoomCells.find(function(adj){
				//console.log("adj.r: ", adj.r);
				//console.log("roomToConnect.id: ", roomToConnect.id);
				return adj.r == roomToConnect.id;
			})

			//console.log(adjacencyObj);

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
				//console.log("WTF MATE");
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

			//console.log("RoomA tiles: ", roomA.tiles);

			//work it out from fX and fY

			if(oY < 0){
				//console.log("connectedRoom is to RIGHT");
				chkTiles = [];//roomA.tiles[length-1];
				l = roomA.tiles[0].length;
				for(let t = 0; t < l; t++){
					chkTiles.push(roomA.tiles[roomA.tiles.length-1][t]);
				}
				xOffset = 0;
				yOffset = 2;
				wOffsetX = 0;
				wOffsetY = 1;
				
				//console.log("want to check RIGHT");
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

				
				//console.log("want to check BOT");
			}
			else if(oY > 0){
				//console.log("connectedRoom is to LEFT");
				chkTiles = [];//roomA.tiles[0];
				l = roomA.tiles[0].length;
				for(let t = 0; t < l; t++){
					chkTiles.push(roomA.tiles[0][t]);
				}
				xOffset = 0;
				yOffset = -2;
				wOffsetX = 0;
				wOffsetY = -1;
				//console.log("want to check LEFT");
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
			
				//console.log("want to check TOP");
			}

			let endOfSharedWallFound = false;
			let ct = 0;
			let sharedWallLength = 0;
			let sharedWall = [];


			//console.log("chkTiles: ", chkTiles);

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
					//console.log("x: ", chkX+xOffset, "y: ", chkY+yOffset, "FLOOR");
					if(map[chkX+xOffset][chkY+yOffset] == Tile.FLOOR){
						sharedWallLength++;
						sharedWall.push({x: chkX+wOffsetX, y: chkY+wOffsetY});
					}
					else{
						//console.log("HIT WALL");
						endOfSharedWallFound = true;
					}
				}
				else{
					//console.log("x: ", chkX+xOffset, "y: ", chkY+yOffset, "NOT RIGHT FLOOR");
				}
				ct++;
			}


			//for time being, door can be placed if sharedwall only has one tile, not ideal though
			if(sharedWall.length == 1){
				console.log("TINY WALL");
				map[sharedWall[0].x][sharedWall[0].y] = Tile.DOOR; 
				doors.push({x: sharedWall[0].x, y: sharedWall[0].y});
			}
			else{
				let halfWayPoint = Math.floor(sharedWallLength/2);
				let newDoorPosition = sharedWall[halfWayPoint-1];

				console.log("halfWayPoint: " + halfWayPoint);
				console.log("newDoorPosition: " + newDoorPosition);

				//console.log(roomA);
				//console.log(roomB);

				//console.log("THE GREAT WALL:", sharedWall);
				//console.log("THE GREAT DOOR POSITION:", newDoorPosition);

				map[newDoorPosition.x][newDoorPosition.y] = Tile.DOOR;
				doors.push({x: newDoorPosition.x, y: newDoorPosition.y});
			}
		}
	}
}


// }());




