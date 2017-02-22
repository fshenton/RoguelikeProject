//expect().to....();
//matchers: toContain(), toEqual()
//use beforeEach to set up variables if they are to be used in every spec
//afterEach is the same but after each spec
//can add custom matchers using this.addMatcher({ name: function(){ return x == y}})

describe('Floor', function() {
	var rg = new roguelikeGame();
	rg.create();
	it('should have created map with 40x40 dimensions', function() {
	    expect(map.length).toEqual(40);
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
	it('should have started on floor 1', function() {
	    expect(floorNumber).toEqual(1);
	});
	it('should have added actors equal to numEnemies+1', function() {
	    expect(actorList.length).toEqual(numEnemies+1);
	});
	it('should have started on floor 1', function() {
	    expect(floorNumber).toEqual(1);
	});
	it('should have creates doors equal to rooms-1', function() {
	    expect(doors.length).toEqual(rooms.length-1);
	});
	it('should have creates doors equal to rooms-1', function() {
	    expect(doors.length).toEqual(rooms.length-1);
	});
});
