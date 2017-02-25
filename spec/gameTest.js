//expect().to....();
//matchers: toContain(), toEqual()
//use beforeEach to set up variables if they are to be used in every spec
//afterEach is the same but after each spec
//can add custom matchers using this.addMatcher({ name: function(){ return x == y}})

describe('Game', function() {
	var rg = new roguelikeGame();
	rg.create();
	// it('should have floorNumber of 1', function() {
	//     expect(floorNumber).toEqual(1);
	// });
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
	it('should be gameOver (victory) if final mainframe is hacked', function() {
	    let terminal = terminalList[0];
	    terminal.finalMainframe = true;
	    terminal.finalMainframeHack();
	    expect(gameOver).toEqual(true);
	});
	it('should not place actors in the same starting tile as another actor', function() {
	    let moreThanOneActorInTile = false
	    for(let i = 0; i < actorPositions.length; i++){
	    	let actor1 = actorPositions[i];
	    	for(let j = i+1; j < actorPositions.length; j++){
	    		if(actor1 == actorPositions[j]){
	    			moreThanOneActorInTile = true;
	    		}
	    	}
	    }
	    expect(moreThanOneActorInTile).toEqual(false);
	});
	it('should not place terminals in the same starting tile as another terminal', function() {
	    let moreThanOneTerminalInTile = false
	    for(let i = 0; i < terminalPositions.length; i++){
	    	let terminal1 = terminalPositions[i];
	    	for(let j = i+1; j < terminalPositions.length; j++){
	    		if(terminal1 == terminalPositions[j]){
	    			moreThanOneTerminalInTile = true;
	    		}
	    	}
	    }
	    expect(moreThanOneTerminalInTile).toEqual(false);
	});
	it('should not place lootBoxes in the same starting tile as another terminal or lootBox', function() {
	    let moreThanOneObjectInTile = false
	    for(let i = 0; i < terminalPositions.length; i++){
	    	let terminal = terminalPositions[i];
	    	for(let j = 0; j < lootPositions.length; j++){
	    		if(terminal == lootPositions[j]){
	    			moreThanOneObjectInTile = true;
	    		}
	    	}
	    }
	    expect(moreThanOneObjectInTile).toEqual(false);
	});
});

