//expect().to....();
//matchers: toContain(), toEqual()
//use beforeEach to set up variables if they are to be used in every spec
//afterEach is the same but after each spec
//can add custom matchers using this.addMatcher({ name: function(){ return x == y}})

describe('Terminal', function() {
	var options1 = ["Heal", "Upgrade Damage", "Upgrade HP", "Log Off"];
	var terminal1 = new Terminal(options1, 5, 5, false);
	var options2 = ["UPLOAD VIRUS", "Log Off"];
	var terminal2 = new Terminal(options2, 2, 2, true);
	it('should have 4 options (Heal, Upgrade Damage, Upgrade HP, Log Off) and not be final', function() {
	    expect(terminal1.options.length).toEqual(4);
	    expect(terminal1.options[0]).toEqual("Heal");
	    expect(terminal1.options[1]).toEqual("Upgrade Damage");
	    expect(terminal1.options[2]).toEqual("Upgrade HP");
	    expect(terminal1.options[3]).toEqual("Log Off");
	    expect(terminal1.finalMainframe).toEqual(false);
	});
	it('should have 2 options (UPLOAD VIRUS, Log Off) and be final', function() {
	    expect(terminal2.options.length).toEqual(2);
	    expect(terminal2.options[0]).toEqual("UPLOAD VIRUS");
	    expect(terminal2.options[1]).toEqual("Log Off");
	    expect(terminal2.finalMainframe).toEqual(true);
	});
});
