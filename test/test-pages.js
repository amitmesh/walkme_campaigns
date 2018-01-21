var expect  = require('chai').expect;
var request = require('request');

it('Should get 3 campaigns for user 33333', function(done) {	

	testNumOfCampaigns(3);
	
	testNumOfCampaigns(3);
	
	testNumOfCampaigns(3);
	
	testNumOfCampaigns(2);
	
	testNumOfCampaigns(1);
	done();
	
});

function testNumOfCampaigns(expectedNumOfCampaigns) {
	request('http://localhost:2000/?user_id=33333' , function(error, response, body) {
		var campaignsRes = JSON.parse(body);
		console.log("body = " + campaignsRes[0]);
		console.log("campaignsRes.length = " + campaignsRes.length);
		expect(campaignsRes.length).to.equal(expectedNumOfCampaigns);
        
    });

}