//expect().to....();
//matchers: toContain(), toEqual()
//use beforeEach to set up variables if they are to be used in every spec
//afterEach is the same but after each spec
//can add custom matchers using this.addMatcher({ name: function(){ return x == y}})

describe('Floor', function() {
	var rg = new roguelikeGame();
	rg.create();
	it('should have created map with 40x40 dimensions', function() {
	    expect(map.length).toEqual(30);
	});
	it('should have created rooms equal to numRooms', function() {
	    expect(rooms.length).toEqual(numRooms);
	});
	it('should have created terminals equal to terminalNumber', function() {
		expect(terminalList.length).toEqual(terminalNumber);
	});
	it('should have created loot boxes equal to lootNumber', function() {
	    expect(lootList.length).toEqual(lootNumber);
	});
	it('should have created defined enemy ratios for each floor', function() {
	    expect(enemyRatios.length).toEqual(topFloor);
	});
	// it('should have started on floor 1', function() {
	//     expect(floorNumber).toEqual(1);
	// });
	it('should have added actors equal to numEnemies+1', function() {
	    expect(actorList.length).toEqual(numEnemies+1);
	});
	it('should have creates doors equal to rooms-1', function() {
	    expect(doors.length).toEqual(rooms.length-1);
	});
	it('should have perimeter wall around map (115 tiles), and have one exit tile', function(){
		let wallCount = 0;
		let exitCount = 0;
		for(let i = 0; i < mapSize; i++){
			if(i == 0 || i == mapSize-1){
				for(let j = 0; j < mapSize; j++){
					if(map[i][j] == Tile.WALL){
						wallCount++;
					}
					else if(map[i][j] == Tile.EXIT){
						exitCount++;
					}
				}
			}
			else{
				if(map[i][0] == Tile.WALL){
					wallCount++;
				}
				else if(map[i][0] == Tile.EXIT){
					exitCount++;
				}

				if(map[i][mapSize-1] == Tile.WALL){
					wallCount++;
				}
				else if(map[i][mapSize-1] == Tile.EXIT){
					exitCount++;
				}
			}
			
		}
		expect(wallCount).toEqual(115);
		expect(exitCount).toEqual(1);
	});
	it('should not have any doors blocked by terminals or lootBoxes', function() {
	    let doorBlocked = false;

	    for(let i = 0; i < terminalList; i++){
	    	let x = terminalList[i].x;
	    	let y = terminalList[i].y;
	    	if(map[y][x-1] == Tile.DOOR ||
	    		map[y][x+1] == Tile.DOOR ||
	    		map[y+1][x] == Tile.DOOR ||
	    		map[y-1][x] == Tile.DOOR){
	    		doorBlocked == true;
	    	}
	    }
	    for(let i = 0; i < lootList; i++){
	    	let x = lootList[i].x;
	    	let y = lootList[i].y;
	    	if(map[y][x-1] == Tile.DOOR ||
	    		map[y][x+1] == Tile.DOOR ||
	    		map[y+1][x] == Tile.DOOR ||
	    		map[y-1][x] == Tile.DOOR){
	    		doorBlocked == true;
	    	}
	    }

	    expect(doorBlocked).toEqual(false);
	});
	it('should have changed values (healCost, floorNumber, if final floor) when proceeding to floor 2', function() {
		setupFloor(2);
		expect(floorNumber).toEqual(2);
		expect(healCost).toEqual(100);
		expect(floorNumber == topFloor).toEqual(false);
	});
	it('should have changed values (healCost, floorNumber, if final floor) when proceeding to final floor', function() {
		setupFloor(10);
		expect(floorNumber).toEqual(10);
		expect(healCost).toEqual(300);
		expect(floorNumber == topFloor).toEqual(true);
	});
});
