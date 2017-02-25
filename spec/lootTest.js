//expect().to....();
//matchers: toContain(), toEqual()
//use beforeEach to set up variables if they are to be used in every spec
//afterEach is the same but after each spec
//can add custom matchers using this.addMatcher({ name: function(){ return x == y}})

describe('Augs and LootBox', function() {

	var aug1 = new Augmentation(Aug.VAMP, 1, 0.05);
	var aug2 = new Augmentation(Aug.DEF, 2, 0.05);
	var aug3 = new Augmentation(Aug.APUP, 3, 0.05);
	var loot1 = new LootBox(aug1, 100, 8, 10);
	var loot2 = new LootBox(aug2, 0, 9, 10);
	var loot3 = new LootBox(aug3, 357, 10, 10);
	it('should have aug of type Aug.VAMP, with a level of 1, effect of 0.05 and credits of 100', function() {
	    expect(loot1.aug.type).toEqual(Aug.VAMP);
	    expect(loot1.aug.effectVal).toEqual(0.05);
	    expect(loot1.aug.level).toEqual(1);
	    expect(loot1.credits).toEqual(100);
	});
	it('should have aug of type Aug.DEF, with a level of 2, effect of 0.05 and credits of 0', function() {
	    expect(loot2.aug.type).toEqual(Aug.DEF);
	    expect(loot2.aug.effectVal).toEqual(0.05);
	    expect(loot2.aug.level).toEqual(2);
	    expect(loot2.credits).toEqual(0);
	});
	it('should have aug of type Aug.APUP, with a level of 3, effect of 0.05 and credits of 357', function() {
	    expect(loot3.aug.type).toEqual(Aug.APUP);
	    expect(loot3.aug.effectVal).toEqual(0.05);
	    expect(loot3.aug.level).toEqual(3);
	    expect(loot3.credits).toEqual(357);
	});
	it('should have effective power of 0.05 (vamp)', function(){
		expect(loot1.aug.level*loot1.aug.effectVal).toBeCloseTo(0.05);
	});
	it('should have effective power of 0.10 (def)', function(){
		expect(loot2.aug.level*loot2.aug.effectVal).toBeCloseTo(0.10);
	});
	it('should have effective power of 0.15 (mobility)', function(){
		expect(loot3.aug.level*loot3.aug.effectVal).toBeCloseTo(0.15);
	});
});
