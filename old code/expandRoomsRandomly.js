
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
}