//expect().to....();
//matchers: toContain(), toEqual()
//use beforeEach to set up variables if they are to be used in every spec
//afterEach is the same but after each spec
//can add custom matchers using this.addMatcher({ name: function(){ return x == y}})

describe('Game', function() {
	var rg = new roguelikeGame();
	rg.create();
	it('should have floorNumber of 1', function() {
	    expect(floorNumber).toEqual(1);
	});
	it('should have enemiesKilled of 0', function() {
	    expect(enemiesKilled).toEqual(0);
	});
	it('should have creditsEarned of 0', function() {
	    expect(creditsEarned).toEqual(0);
	});
	it('should have expThreshold of 800', function() {
	    expect(expThreshold).toEqual(800);
	});
	it('should have healCost of 50', function() {
	    expect(healCost).toEqual(50);
	});
	it('should have upgradeDmgCost of 200', function() {
	    expect(upgradeDmgCost).toEqual(200);
	});
	it('should have upgradeHpCost of 200', function() {
	    expect(upgradeHpCost).toEqual(200);
	});
});

