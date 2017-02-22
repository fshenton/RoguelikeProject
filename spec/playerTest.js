//expect().to....();
//matchers: toContain(), toEqual()
//use beforeEach to set up variables if they are to be used in every spec
//afterEach is the same but after each spec
//can add custom matchers using this.addMatcher({ name: function(){ return x == y}})

describe('Player', function() {
	var player = new Player(null, "Kiriyama", 10, 10, 100);
	it('should be have null game', function() {
	    expect(player.game).toEqual(null);
	});
	it('should be called Kiriyama', function() {
	    expect(player.name).toEqual("Kiriyama");
	});
	it('should have x of 10', function() {
	    expect(player.x).toEqual(10);
	});
	it('should have y of 10', function() {
	    expect(player.y).toEqual(10);
	});
	it('should have 100 health', function() {
	    expect(player.hp).toEqual(100);
	});
});