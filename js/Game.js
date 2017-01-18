'use strict';

var Roguelike = Roguelike || {};

Roguelike.Game = function(){};

const mapSize = 50;
const minRoomsize = 3;
const numRooms = 15;
const floorChar = 'R';
const wallChar = 'w';

var gameMusic;
var map, rooms, player, actorList, UI;

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

		console.log(JSON.stringify(map));

		for(let i = 0; i < rooms.length; i++){
			console.log(rooms[i]);
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
	this.canExp = true
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
	let roomsRemaining = numRooms;

	while(roomsRemaining > 0){

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

		let currentRoom = numRooms - roomsRemaining; 

		//create new Room object and fill its tile array
		let room  = new Room(currentRoom);
		room.tiles[0] = [{x: x-1, y: y-1}, {x: x, y: y-1}, {x: x+1, y: y-1}];
		room.tiles[1] = [{x: x-1, y: y}, {x: x, y: y}, {x: x+1, y: y}];
		room.tiles[2] = [{x: x-1, y: y+1}, {x : x, y: y+1}, {x: x+1, y: y+1}];

		//add new room to rooms array
		rooms[currentRoom] = room;
		
		//console.log(JSON.stringify(rooms[currentRoom]));
		//console.log(rooms[currentRoom].tiles);

		roomsRemaining--;
		console.log("Room " + currentRoom + " with x:" + x + " y: " + y + " created.");
		
	}

	//console.log(JSON.stringify(map));
}

function checkValidRoomSize(x, y){
	//console.log("in checkvalidroom");

	let space = false;

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
			map[x][y-2] == Tile.WALL &&
			map[x+2][y-2] == Tile.WALL && 
			map[x-2][y] == Tile.WALL &&
			map[x+2][y] == Tile.WALL &&
			map[x-2][y+2] == Tile.WALL &&
			map[x][y+2] == Tile.WALL &&
			map[x+2][y+2] == Tile.WALL){

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

	console.log("in expand random room method");

	while(roomCannotExpand < numRooms){

		console.log("rooms left for expanding");

		let rndRoom = Math.floor(Math.random() * rooms.length);
		let rndDir = Math.floor(Math.random() * 4);
		//let rndDir = 3;
		//let rndDir = Math.floor(Math.random() * 2);

		let checkRoom = rooms[rndRoom];

		//worth removing failed expansions from list of possible directions?

		if(checkRoom.canExp){
			console.log("room can expand");
			let expResult = expand(checkRoom, rndDir);
			if(!expResult){
				console.log("Couldn't expand room ", checkRoom.id);
			}
			else{
				console.log("Expanded room ", checkRoom.id);
			}

			if(!expResult && !checkRoom.expLeft && !checkRoom.expTop
				&&!checkRoom.expRight && !checkRoom.expBot){
				checkRoom.canExp = false;
				roomCannotExpand++;
			}
		}
	}

	//return?
}

function expand(r, d){

	console.log("in expand method");

	let success;

	switch(d){
		case 0: //LEFT
			success = false;
			if(r.expLeft){
				let oobCheck = r.tiles[0][0].y-2;
				if(oobCheck >= 0){
					let roomToExpand = true;

					for(let i = 0; i < r.tiles[0].length; i++){
						let checkX = r.tiles[0][i].x;
						let checkY = r.tiles[0][i].y;

						if(i == 0){
							if(map[checkX-1][checkY-1] != Tile.WALL || map[checkX-1][checkY-2] != Tile.WALL){
								roomToExpand = false;
								console.log("Other room found to upper left.");
							}
						}
						else if(i == r.tiles[0].length-1){
							if(map[checkX+1][checkY-1] != Tile.WALL || map[checkX+1][checkY-2] != Tile.WALL){
								roomToExpand = false;
								console.log("Other room found to lower left.");
							}
						}
						if(map[checkX][checkY-1] != Tile.WALL || map[checkX][checkY-2] != Tile.WALL){
							roomToExpand = false;
							console.log("Other room found to left.");
						}		
					}

					if(roomToExpand){
						r.tiles.unshift([]);
						for(let i = 0; i < r.tiles[1].length; i++){
							let newX = r.tiles[1][i].x;
							let newY = r.tiles[1][i].y-1
							
							r.tiles[0].push({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							console.log("Room " + r.id + " expanded left.");

							success = true;
						}
					}
					else{
						r.expLeft = false;
					}
				}
				else{
					console.log("FOUND OUT OF BOUNDS (LEFT) ", oobCheck);
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
								console.log("Other room found to upper left.");
							}
						}
						else if(i == r.tiles.length-1){
							if(map[checkX-1][checkY+1] != Tile.WALL || map[checkX-2][checkY+1] != Tile.WALL){
								roomToExpand = false;
								console.log("Other room found to upper right.");
							}
						}
						if(map[checkX-1][checkY] != Tile.WALL || map[checkX-2][checkY] != Tile.WALL){
							roomToExpand = false;
							console.log("Other room found above.");
						}		
					}

					if(roomToExpand){				
						for(let i = 0; i < r.tiles.length; i++){
							let newX = r.tiles[i][0].x-1;
							let newY = r.tiles[i][0].y;
							
							r.tiles[i].unshift({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							console.log("Room " + r.id + " expanded top.");

							success = true;
						}
					}
					else{
						r.expTop = false;
					}
				}
				else{
					console.log("FOUND OUT OF BOUNDS (TOP) ", oobCheck);
					r.expTop = false;
				}
			}
			return success;
			break;
		case 2: //RIGHT
			success = false;
			if(r.expRight){
				let l = r.tiles.length;
				let oobCheck = r.tiles[l-1][0].y+2;
				console.log("oob: ", oobCheck, " mapSize: ", mapSize);
				if(oobCheck < mapSize){
					let roomToExpand = true;

					for(let i = 0; i < r.tiles[0].length; i++){
						let checkX = r.tiles[l-1][i].x;
						let checkY = r.tiles[l-1][i].y;

						if(i == 0){
							if(map[checkX-1][checkY+1] != Tile.WALL || map[checkX-1][checkY+2] != Tile.WALL){
								roomToExpand = false;
								console.log("Other room found to upper right.");
							}
						}
						else if(i == l){
							if(map[checkX+1][checkY+1] != Tile.WALL || map[checkX+1][checkY+2] != Tile.WALL){
								roomToExpand = false;
								console.log("Other room found to lower right.");
							}
						}
						if(map[checkX][checkY+1] != Tile.WALL || map[checkX][checkY+2] != Tile.WALL){
							roomToExpand = false;
							console.log("Other room found to right.");
						}		
					}

					if(roomToExpand){
						l = r.tiles.push([]); //l is new length
						for(let i = 0; i < r.tiles[1].length; i++){
							let newX = r.tiles[l-2][i].x;
							let newY = r.tiles[l-2][i].y+1;
							
							r.tiles[l-1].push({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							console.log("Room " + r.id + " expanded right.");

							success = true;
						}
					}
					else{
						r.expRight = false;
					}
				}
				else{
					console.log("FOUND OUT OF BOUNDS (RIGHT) ", oobCheck);
					r.expRight = false;
				}
			}
			return success;
			break;
		case 3: //BOT
			success = false;
			if(r.expBot){
				let l = r.tiles[0].length;
				let oobCheck = r.tiles[0][l-1].x+2;
				if(oobCheck < mapSize){

					let roomToExpand = true;
					for(let i = 0; i < r.tiles.length; i++){
						let checkX = r.tiles[i][l-1].x;
						let checkY = r.tiles[i][l-1].y;

						if(i == 0){
							if(map[checkX+1][checkY-1] != Tile.WALL || map[checkX+2][checkY-1] != Tile.WALL){
								roomToExpand = false;
								console.log("Other room found to lower left.");
							}
						}
						else if(i == r.tiles.length-1){
							if(map[checkX+1][checkY+1] != Tile.WALL || map[checkX+2][checkY+1] != Tile.WALL){
								roomToExpand = false;
								console.log("Other room found to lower right.");
							}
						}
						if(map[checkX+1][checkY] != Tile.WALL || map[checkX+2][checkY] != Tile.WALL){
							roomToExpand = false;
							console.log("Other room found below.");
						}		
					}

					if(roomToExpand){				
						for(let i = 0; i < r.tiles.length; i++){
							let newX = r.tiles[i][l-1].x+1;
							let newY = r.tiles[i][l-1].y;
							
							r.tiles[i].push({x: newX, y: newY});

							map[newX][newY] = Tile.FLOOR;

							console.log("Room " + r.id + " expanded bot.");

							success = true;
						}
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
			return success;
			break;
		default:
			console.log("invalid case number");
			break;
	}
}

/*
function expandRoomsRandomly(){

	//let roomsToExpand = [rooms.length];
	//roomsToExpand needs to contain reference to rooms in rooms list?
	let directionList = [];

	for(let d = 0; d < rooms.length; d++){
		//initialise max number of directions we need to check
		directionList.push({left: true, 
			top: true, 
			right: true, 
			bottom: true, 
			directionsRemaining: 4, 
			roomNo: d});
	}

	// console.log(JSON.stringify(directionList));
	// console.log(
	// 	"First room in direction list:" + 
	// 	"\nLeft: " + directionList[0].left +
	// 	"\nTop: " + directionList[0].top + 
	// 	"\nRight: " + directionList[0].right + 
	// 	"\nBot: " + directionList[0].bottom + 
	// 	"\nDirections: " + directionList[0].directionsRemaining + 
	// 	"\nRoomNo: " + directionList[0].roomNo
	// 	)

	console.log("Length of Direction List: ", directionList.length)

	while(directionList.length > 0){
		let rndRoom = Math.floor(Math.random() * directionList.length);
		let rndDirection = Math.floor(Math.random() * 4);

		console.log("------------------------------------------");
		console.log("Rnd Room: ", rndRoom);
		console.log("Rnd Direction: ", rndDirection);

		switch(rndDirection){
			case 0:
				if(directionList[rndRoom].left == true){
					console.log("BOUT TO CHECK IF CAN EXPAND LEFT");
					let spaceLeft = tryExpandWall(directionList[rndRoom].roomNo, 0, 0, -2, -1);
					if(!spaceLeft){
						directionList[rndRoom].left = false;
						directionList[rndRoom].directionsRemaining--;
						console.log("No space on left for room ", directionList[rndRoom].roomNo);
					}
				}
				break;
			case 1:
				if(directionList[rndRoom].top == true){
					console.log("BOUT TO CHECK IF CAN EXPAND TOP");
					let spaceTop = tryExpandWall(directionList[rndRoom].roomNo, -2, -1, 0, 0);
					if(!spaceTop){
						directionList[rndRoom].top = false;
						directionList[rndRoom].directionsRemaining--;
						console.log("No space on top for room ", directionList[rndRoom].roomNo);
					}
				}
				break;
			case 2:
				if(directionList[rndRoom].right == true){
					console.log("BOUT TO CHECK IF CAN EXPAND RIGHT");
					let spaceRight = tryExpandWall(directionList[rndRoom].roomNo, 0, 0, 2, 1);
					if(!spaceRight){
						directionList[rndRoom].right = false;
						directionList[rndRoom].directionsRemaining--;
						console.log("No space on right for room ", directionList[rndRoom].roomNo);
					}
				}
				break;
			case 3:
				if(directionList[rndRoom].bottom == true){
					console.log("BOUT TO CHECK IF CAN EXPAND BOT");
					let spaceBottom = tryExpandWall(directionList[rndRoom].roomNo, 2, 1, 0, 0);
					if(!spaceBottom){
						directionList[rndRoom].down = false;
						directionList[rndRoom].directionsRemaining--;
						console.log("No space on bottom for room ", directionList[rndRoom].roomNo);
					}
				}
				break;
			default:
				console.log("No Directions Found");
				break;
		}
		if(directionList[rndRoom].directionsRemaining <= 0){
			console.log("Nowhere to expand into for Room ", rooms[directionList[rndRoom].roomNo]);
			directionList.splice(rndRoom, 1);
		}
	}

	//while roomsToExpand.length > 0

		//pick random inclusive number from 0-rooms.length-1
		//random inclusive (0, directionList.length-1)
		//switch based on number, call left/up/right/down method

		//if cannot expand in that from direction, remove direction from direction list
		//if directions.length <= 0, roomsToExpand - 1, remove room from roomsToExpand 
		
		//roomsToExpand = [{left: , up: , right:, down:  ,directionsRemaining: x}];
				
}
	
function tryExpandWall(i, x1, x2, y1, y2){

	//i is the room number to check in rooms, x1,x2,y1 and y2 are offsets used to check surrounding area
	//left: check oob is y-2, checking for walls is also y-2, add floor to room is y-1
	//right: check oob is y+2, checking for walls is also y+2, add floor to room is y+1
	//up: check oob is x-2, checking for walls is also x-2, add floor to room is x-1
	//down: check oob is x+2, checking for walls is also x+2, add floor to room is x+1

	//console.log(i);
	//console.log("Room " + i + " " + rooms[i]);
	//console.log(rooms[i][0]);
	//console.log(rooms[i][0][0]);
	//console.log(rooms[i][j][0].x+x2)
	//console.log(rooms[i][j][0].y+y2);

	let oobCheck;
	let lengthOfDimension;

	if(y1 == -2 || y1 == 2){
		oobCheck = rooms[i][0][0].y+y1;
		//WHICH DIMENSION SHOULD WE BE MEASURING FOR VERT/HORIZ?
		//lengthOfDimension = rooms[0].length;
		lengthOfDimension = rooms[0][0].length;	
		/*for(let i = 0; i < rooms[0][0].length; i++){
			if(rooms[0][0][i] != undefined){
				console.log(rooms[0][0][i]);
				lengthOfDimension++;
			}
		}
	}
	else if(y1 == 0){
		oobCheck = rooms[i][0][0].x+x1;
		//WHICH DIMENSION SHOULD WE BE MEASURING FOR VERT/HORIZ?
		//lengthOfDimension = rooms[0][0].length;
		lengthOfDimension = rooms[0].length;
	}
	else{
		console.log("Invalid offsets");
		return false;
	}

	console.log("length: " + lengthOfDimension);

	let canExpand;


	if(oobCheck >= 0)
	{
		//iterate through each column in room
		for(let j = 0; j < lengthOfDimension; j++){
			canExpand = true;
			//for each row (length of left wall)


			//DEPENDS ON IF HORIZONTAL OR VERTICAL EXPANSION
			while(j < lengthOfDimension && canExpand){
				//check the first (top most) value of each row
				//NEED TO ADD OPTIONS FOR LEFT, RIGHT, DOWN, OTHERWISE TOP IS ALWAYS MOVED
				//LEFT + RIGHT: k=0, k=1, k=2
				//TOP: k = 0
				//BOT: k = length-1
				//console.log(rooms[i][0][j]);
				//console.log(rooms[i][0][j].x);

				if(y1 == -2){
					console.log("checkExpandLeft");
					console.log("x+x1: ", rooms[i][0][j].x+x1);
					console.log("y+y1: ", rooms[i][0][j].y+y1);
					//console.log(map[rooms[i][0][j].x+x1][rooms[i][0][j].y+y1]);
					if(map[rooms[i][0][j].x+x1][rooms[i][0][j].y+y1] !=wallChar){
						console.log("cannotExpandLeft");
						canExpand = false;
					}
				}
				else if(x1 == -2){
					console.log("checkExpandTop");
					//console.log(map[rooms[i][j][0].x+x1][rooms[i][j][0].y+y1]);
					if(map[rooms[i][j][0].x+x1][rooms[i][j][0].y+y1] !=wallChar){
						console.log("cannotExpandTop");
						canExpand = false;
					}
				}
				else if(y1 == 2){
					console.log("checkExpandRight");
					console.log("x+x1: ", rooms[i][lengthOfDimension-1][j].x+x1);
					console.log("y+y1: ", rooms[i][lengthOfDimension-1][j].y+y1);
					//console.log(map[rooms[i][lengthOfDimension-1][j].x+x1][rooms[i][lengthOfDimension-1][j].y+y1]);
					if(map[rooms[i][lengthOfDimension-1][j].x+x1][rooms[i][lengthOfDimension-1][j].y+y1] !=wallChar){
						console.log("cannotExpandRight");
						canExpand = false;
					}
				}
				else if(x1 == 2){
					console.log("checkExpandBot");
					//console.log(map[rooms[i][j][lengthOfDimension-1].x+x1][rooms[i][j][lengthOfDimension-1].y+y1]);
					if(map[rooms[i][j][lengthOfDimension-1].x+x1][rooms[i][j][lengthOfDimension-1].y+y1] !=wallChar){
						console.log("cannotExpandBot");
						canExpand = false;
					}
				}	
				else{
					console.log("didn't get if");
				}
				j++;
			}
			if(canExpand){
				let j = 0;
				//DEPENDS ON IF HORIZONTAL OR VERTICAL EXPANSION
				while(j < lengthOfDimension){
					//change map to reflect wall has been pushed back 1 to top

					//NEED TO ADD OPTIONS FOR LEFT, RIGHT, DOWN, OTHERWISE TOP IS ALWAYS MOVED
					if(y1 == -2){
						map[rooms[i][0][j].x+x2][rooms[i][0][j].y+y2] = floorChar; //this works
						//if(j==0){
							//rooms[i].unshift([]);
							//console.log(rooms[i][0]);
						//} 
						//do only once
						rooms[i][j].push({x: rooms[i][0][j].x+x2, y: rooms[i][0][j].y+y2});
						//ADD TO LEFT
						console.log("new length: ", rooms[i][j].length);
					}
					else if(x1 == -2){
						map[rooms[i][j][0].x+x2][rooms[i][j][0].y+y2] = floorChar;
						rooms[i][j].unshift({x: rooms[i][j][0].x+x2, y: rooms[i][j][0].y+y2});
						//ADD TO TOP
					}
					else if(y1 == 2){
						map[rooms[i][lengthOfDimension-1][j].x+x2][rooms[i][lengthOfDimension-1][j].y+y2] = floorChar;
						//if(j==0){ rooms[i].push([]);} //do only once
						//console.log(rooms[i][0]);
						rooms[i][j].push({x: rooms[i][lengthOfDimension-1][j].x+x2, y: rooms[i][lengthOfDimension-1][j].y+y2});
						//PUSH TO RIGHT
						console.log("new length: ", rooms[i][j].length);
					}
					else if(x1 == 2){
						map[rooms[i][j][lengthOfDimension-1].x+x2][rooms[i][j][lengthOfDimension-1].y+y2] = floorChar;
						rooms[i][j].push({x: rooms[i][j][lengthOfDimension-1].x+x2, y: rooms[i][j][lengthOfDimension-1].y+y2});
						//PUSH TO BOT
					}
					//add new tile to top column of each row of array (new floor area)
					
					j++;
				}
			}
			console.log("Room expanded?", canExpand);
		}
	}

	return canExpand;
}*/





