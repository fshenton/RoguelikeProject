'use strict';

var Roguelike = Roguelike || {};

Roguelike.Game = function(){};

const mapSize = 50;
const minRoomsize = 3;
const numRooms = 10;
const floorChar = 'R';
const wallChar = 'w';

var gameMusic;
var map, rooms, player, actorList, UI;

var unnecessaryChecks;

Roguelike.Game.prototype = {
	create: function(){
		console.log("Game started");

		//debug
		//show name
		/*console.log(localStorage.getItem("playerName"));

		var text = localStorage.getItem("playerName");
		var style = {font: "30px Arial", fill: "#fff", align: "center"};
		var t = this.game.add.text(this.game.width/2, 15, text, style);
		t.anchor.set(0.5);*/

		//play music
		// gameMusic = this.game.add.audio('gameMusic');
		// gameMusic.play();

		//set up map
		initMap();
		expandRandomRooms();
		//findAdjacentRooms();
		//connectRooms();

		console.log(JSON.stringify(map));


		for(let i = 0; i < rooms.length; i++){
			let r = rooms[i];
			console.log("Room ", r.id, "(x: ", r.tiles[0][0].x, " y: ",  r.tiles[0][0].y, ") has:")
			console.log(r.adjRoomCount, " rooms adjacent to it.");
			console.log(r.roomToLeft, " rooms to its left.");
			console.log(r.roomToTop, " rooms to its top.");
			console.log(r.roomToRight, " rooms to its right.");
			console.log(r.roomToBot, " rooms to its bot.");
			console.log(r.adjacentRooms);
			console.log(r.tiles);
		}

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

var Tile = {
	WALL: '#',
	FLOOR: '.',
	DOOR: '%',
	PLAYER: '&'
};

function Room(currentRoom){
	this.id = currentRoom,
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
	this.adjRoomCount = 0,
	this.roomToLeft = 0,
	this.roomToTop = 0,
	this.roomToRight = 0,
	this.roomToBot = 0;
	//methods?
}

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
								console.log("----------------------------------------------");
								if(map[checkX][checkY-1]== Tile.FLOOR){
									console.log("WTF");
								}
								console.log("Room", r.id, "checking adjacent room to left");
								let adjRoom = findRoomCell(0, checkX, checkY-2);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);
									r.roomToLeft++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);
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
								console.log("----------------------------------------------");
								if(map[checkX-1][checkY] == Tile.FLOOR){
									console.log("WTF");
								}
								console.log("Room", r.id, "checking adjacent room to top");
								console.log("checkX:", checkX-2);
								console.log("checkY:", checkY);
								let adjRoom = findRoomCell(1, checkX-2, checkY);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);
									r.roomToTop++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);
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
								console.log("----------------------------------------------");
								if(map[checkX][checkY+1] == Tile.FLOOR){
									console.log("WTF");
								}
								console.log("Room", r.id, "checking adjacent room to right");
								let adjRoom = findRoomCell(2, checkX, checkY+2);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);
									r.roomToRight++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);
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
								console.log("----------------------------------------------");
								if(map[checkX+1 ][checkY] == Tile.FLOOR){
									console.log("WTF");
								}
								console.log("Room", r.id, "checking adjacent room to bot");
								console.log("checkX:", checkX+2);
								console.log("checkY:", checkY);
								let adjRoom = findRoomCell(3, checkX+2, checkY);
								if(r.adjacentRooms.indexOf(adjRoom) == -1){
									r.adjacentRooms.push(adjRoom);
									r.roomToBot++;
									r.adjRoomCount++;
								}
								if(rooms[adjRoom].adjacentRooms.indexOf(r.id) == -1){
									rooms[adjRoom].adjacentRooms.push(r.id);
									rooms[adjRoom].roomToTop++;
									rooms[adjRoom].adjRoomCount++;
								}
								console.log("New adjacent room found (bot)");
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
						//console.log("Room " + r.id + " expanded bot.");
					}
					else{
						r.expBot = false;
					}
				}
				else{
					console.log("FOUND OUT OF BOUNDS (BOT) ", oobCheck);
					r.expBot = false;
				}
			}
			else{
				unnecessaryChecks++;
				//console.log("Shouldn't be checking as flagged that this direction is not expandable.");
			}
			return success;
			break;
		default:
			console.log("invalid case number");
			break;
	}
}

/*function findAdjacentRooms(){
	//for each room
	
	for(let i = 0; i < rooms.length; i++){
		//check all four directions
		//if the roomTo<dir> val is > 0
			//find room in that dir, add it to adjacent rooms with length of shared wall
			//repeat for num of rooms in that direction
		//once all adj rooms have been found, move on to next room
	}
}*/

function findRoomCell(d, cX, cY){

	//d is expansion direction of other room
	//so if d is left, we check right most values of new room

	console.log("Finding index of adjacent room");

	//tiles indexes
	let iX;
	let iY;

	let cellFound = false;
	let p = 0;
	let chkTiles;

	let l;

	while(!cellFound && p < rooms.length){
		console.log("p=", p)
		chkTiles = rooms[p].tiles;

		//IF ROOM IS NOT THE SAME

		if(d == 0){
			if(chkTiles[chkTiles.length-1][0].y == cY){
				let i = 0;
				while(!cellFound && i < chkTiles[chkTiles.length-1].length){
					if(chkTiles[chkTiles.length-1][i].x == cX &&
						chkTiles[chkTiles.length-1][i].y == cY){
						cellFound = true;
						console.log("Room", p, "is left.");
					}
					i++;
				}
				console.log("Room ", p, " has correct y. Cell found =", cellFound);
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
						console.log("Room", p, "is above.");
					}
					i++;
				}
				console.log("Room ", p, " has correct x. Cell found =", cellFound);
			}
			else{
				console.log("Other room x: " + chkTiles[0][l-1].x);
				console.log("Checking room x: " + cX);
			}
		}
		else if(d == 2){
			if(chkTiles[0][0].y == cY){
				let i = 0;
				while(!cellFound && i < chkTiles[0].length){
					if(chkTiles[0][i].x == cX &&
						chkTiles[0][i].y == cY){
						cellFound = true;
						console.log("Room", p, "is right.");
					}
					i++;
				}
				console.log("Room ", p, " has correct y. Cell found =", cellFound);
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
						console.log("Room", p, "is below.");
					}
					i++;
				}
				console.log("Room ", p, " has correct x. Cell found =", cellFound);
			}
			else{
				console.log("Other room x: " + chkTiles[0][0].x);
				console.log("Checking room x: " + cX);
			}
		}
		if(!cellFound){
			console.log("Cell not found, iterating");
			p++;
		}
	}

	if(!cellFound){
		console.log("Couldn't find cell");
	}
	else{
		console.log("Room ", p, " is adjacent to this room.");
	}

	return p;
}

// function connectRooms(){
// 	//need to create an array of the rooms added to the map
// 	//need a reference to the rooms walls (floor edge -1/+1) that are adjacent to other rooms
// 	//obvs walls that border edge of map should not be considered when checking for adjacent rooms
// 	//
// 	let roomsRemaining = 


// }





