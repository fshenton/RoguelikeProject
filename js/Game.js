'use strict';

var Roguelike = Roguelike || {};

Roguelike.Game = function(){};

const mapSize = 50;
const minRoomsize = 3;
const numRooms = 7;
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

//Roguelike.Game.Tile

function initMap(){

	map = [];
	rooms = [];

	//initialise map (make 2d, then fill with walls)
	for(let x = 0; x < mapSize; x++){
		//each col has an array
		map[x] = [];
		//for each row, add a new element with a char
		for(let y = 0; y < mapSize; y++){
			map[x][y] = wallChar;
		}
	}

	map[0][0] = 'HEY';
	map[10][0] = 'HEY';
	map[24][24] = 'HEY';
	// console.log(JSON.stringify(map));

	let minXY = 2;
	let maxXY = mapSize-3; //accounts for wall around the edge

	//plants room seeds away from walls
	let roomsRemaining = numRooms;

	let randomGen = new Phaser.RandomDataGenerator();

	while(roomsRemaining > 0){

		let x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
		let y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;

		//plant seed & grow to 3x3
		let validRoom =false;
		//find a spot for valid room
		while(!validRoom){
			console.log(x);
			console.log(y);
		 	
		 	if(map[x][y] != floorChar){
		 		validRoom = checkValidRoomSize(x, y);
		 		if(!validRoom){
		 			x =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
					y =  Math.floor(Math.random() * (maxXY - minXY + 1)) + minXY;
					console.log("Space not found");
		 		} 
		 	}
		}
		console.log(validRoom);
		//if 3x3 room is available, build room to that size from central point

		//ADDROOM function
		map[x-1][y-1] = floorChar;
		map[x][y-1] = floorChar;
		map[x+1][y-1] = floorChar;
		map[x-1][y] = floorChar;
		map[x][y] = floorChar;
		map[x+1][y] = floorChar;
		map[x-1][y+1] = floorChar;
		map[x][y+1] = floorChar;
		map[x+1][y+1] = floorChar;


		//NEED TO STORE ROOMS AS A 2D ARRAY
		//would this accound for smaller rooms that may intersect? might need midleft etc
		//[0] should be current new room index

		let currentRoom = numRooms - roomsRemaining; //works for remaining = 0?
		//console.log(currentRoom);

		rooms.push([]);
		rooms[currentRoom].push([{x: x-1, y: y-1}, {x: x, y: y-1}, {x: x+1, y: y-1}]);
		rooms[currentRoom].push([{x: x-1, y: y}, {x: x, y: y}, {x: x+1, y: y}]);
		rooms[currentRoom].push([{x: x-1, y: y+1}, {x : x, y: y+1}, {x: x+1, y: y+1}]);
	
		//console.log(JSON.stringify(rooms[currentRoom]));

		roomsRemaining--;
		console.log('Room Created');
		
	}
		//TODO: need to store each room in a list so I can iterate through
		//and have access to wall positions



		//iterate through each room created and pick a random wall to push back 1 space
		//if you can't move that wall, go to next room

	for(let i = 0; i < rooms.length; i++){
		console.log(JSON.stringify(rooms[i]));
		console.log(JSON.stringify(rooms[i][0][0].x));
	}

	console.log(JSON.stringify(map));

	expandRandomWalls();

	console.log(JSON.stringify(map));
	// console.log(JSON.stringify(rooms));
}

function checkValidRoomSize(x, y){
	console.log("in checkvalidroom");
	//checks the 3x3 area around central x, y point to ensure room available

	//TODO: need check for walls around room

	let space = false;

	if(map[x-1][y-1] == wallChar &&
		map[x][y-1] == wallChar &&
		map[x+1][y-1] == wallChar &&
		map[x-1][y] == wallChar &&
		map[x][y] == wallChar &&
		map[x+1][y] == wallChar &&
		map[x-1][y+1] == wallChar &&
		map[x][y+1] == wallChar &&
		map[x+1][y+1] == wallChar){
		
		//check that there are walls all the way around
		if(map[x-2][y-2] == wallChar &&
			map[x][y-2] == wallChar &&
			map[x+2][y-2] == wallChar && //undefined issue! 21
			map[x-2][y] == wallChar &&
			map[x+2][y] == wallChar &&
			map[x-2][y+2] == wallChar &&
			map[x][y+2] == wallChar &&
			map[x+2][y+2] == wallChar){

			space = true;
		}
		else{
			console.log("Cannot have walls around this space");
		}
	}
	else{
			console.log("Not enough floor space found");
	}

	return space;
}

function expandRandomWalls(){

	//NEED TO REFACTOR SO PARTS ARE IN OWN FUNCTIONs

	//KEEP DOING THIS UNTIL NO ROOMS CAN EXPAND ANY FURTHER
	//use flags for each room to indicate if no more expanding can be done
	//might need to ensure that each wall is tried at some point, if all walls tried and no expanding, then flag as done.

	//THIS DOESN'T ACCOUND FOR CHANGING WALL LENGTHS AS ROOMS GET BIGGER
	//iterate through room list
	for (let i = 0; i < rooms.length; i++){
		//pick one of 4 directions to try, using random(0,4)?
		//left, up, right, down
		//left = first elements of each row
		//up = elements of top row
		//right = last elements of each row
		//down = elements of bot row
		
		// TOP WALL
		//check for oob	
		if(rooms[i][0][0].x-2 >= 0){
			//iterate through each column in room
			for(let j = 0; j < rooms[i].length; j++){
				//let k = 0;
				let canExpand = true;

				//for each row (length of left wall)
				while(j < rooms[i].length && canExpand){
				//minus 2?
					//check the first (top most) value of each row
					if(map[rooms[i][j][0].x-2][rooms[i][j][0].y] !=wallChar){
						//if something other than a wall found, cannot expand that direction
						canExpand = false;
					}
					j++;
				}
				if(canExpand){
					let j = 0;
					while(j < rooms[i].length){
						console.log("i", i);
						console.log("j", j);
						console.log("rooms[i][j] length", rooms[i][j].length );
						//change map to reflect wall has been pushed back 1 to top
						map[rooms[i][j][0].x-1][rooms[i][j][0].y] = floorChar;
						//add new tile to top column of each row of array (new floor area)
						rooms[i][j].unshift({x: rooms[i][j][0].x-1, y: rooms[i][j][0].y});
						j++;
					}
				}
				console.log("Room expanded?", canExpand);
			}
		}
		//NEED TO DO FOR EACH ROW IN ROOMS[i]
		//WE'RE ACCESSING ROOMS[i][j][k
	}
	//if I want to push one wall out, pick left, up, down, right wall
	//if left we use top left and bottom left corners
	//check that cells left of these are walls, if they are, we set these new cells to '...' and update topleft, bottomleft
}