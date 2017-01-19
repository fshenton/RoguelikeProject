
	let sharedWall = [];
	let adjRoomCellCount = 0;
	let adjRoomID = 0;
	let newAdjRoom = false;


	if(!newAdjRoom){
		newAdjRoom = true;
		console.log("New adjacent room found");
	}

	if(newAdjRoom){
		if(adjRoomCellCount < 1){
			adjRoomID = findRoomCell(0, checkX, checkY-2);
		}
		//add wall cells between rooms to an array, so we can put a door there
		sharedWall.push({x: checkX, y: checkY-1});
		adjRoomCellCount++;
	}

	if(newAdjRoom){
		if(map[checkX][checkY-2] == Tile.WALL || i == r.tiles[0].length-1){
			if(adjRoomCellCount >= 3){
				console.log("Adjacent room (", adjRoomID, ") large enough for door");
				r.adjacentRooms.push({id: adjRoomID, n: adjRoomCellCount, wall: sharedWall});
				//might need to copy elements from sharedWall?
			}
			else{
				console.log("Not enough room for a door");
			}
			newAdjRoom = false;
			adjRoomID = 0;
			adjRoomCellCount = 0;
			sharedWall = [];
		}
	}