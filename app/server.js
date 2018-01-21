module.exports = function(app)
{
	var expressControllers = require('express-controller');
	expressControllers.setDirectory( __dirname + '../controllers').bind(app);
	
	var cache = require('memory-cache');
	var url = require('url');
	var qs = require('qs');	
	
	// use body-parser to get request.body
	var bodyParser = require('body-parser'); 
	app.use(bodyParser.json()); 
	app.use(bodyParser.urlencoded({ extended: true }));

	var campaigns = [{'id': 100, // id (type: integer) 
							'name': 'Holiday Specials', // campaign name
							'thresholds': { // campaign thresholds:
								'max_total': 1000, // maximum total calls made to this campaign
								'max_per_user': 10//, // maximum calls to this campaign per user
							},
							'data': {}, // campaign data (empty for this exercise)}; 
							'counter' : 0,
							'usersSawThisCampaign' : {}
					},
					{'id': 200, // id (type: integer) 
						'name': 'Rate this app', // campaign name
						'thresholds': { // campaign thresholds:
							'max_total': 300, // maximum total calls made to this campaign
							'max_per_user': 3//, // maximum calls to this campaign per user
						},
						'data': {}, // campaign data (empty for this exercise)};
						'counter' : 0,
						'usersSawThisCampaign' : {}
					},
					{'id': 300, // id (type: integer) 
						'name': 'First come first served', // campaign name
						'thresholds': { // campaign thresholds:
							'max_total': 4, // maximum total calls made to this campaign
							'max_per_user': 10//, // maximum calls to this campaign per user
						},
						'data': {}, // campaign data (empty for this exercise)}; 
						'counter' : 0,
						'usersSawThisCampaign' : {}
					}];

					/** 
	/*  Get all campaigns for user by user_id 
	/*  @param user_id
	/*  @return list of relevant campaigns (according to max_total & max_per_user) 
	/**/
	app.get('/', function(request, response) {
		console.log('get campaigns for User Id: ' + request.query.user_id);
		var user_id = request.query.user_id;
		if (!user_id) {
			return response.send('Missing user id');
		} 
		var allCampaigns = getCampaigns();
		var userCampaigns = getCampaignsForUser(user_id, allCampaigns);
		console.log('userCampaigns = ' + userCampaigns);
		response.send(userCampaigns);
	
	})

	app.get('/home', function(request, response){			
		response.render('home', {campaigns : getCampaigns()});
	});

	/** 
	/*  Reset campaign counter & users counter
	/*  @param campaign_id
	/**/
	app.post('/resetCampaignCounter', function(request, response){
		console.log("resetCampaignCounter is called");
		var parsedUrl = qs.parse(url.parse(request.url).query);
		var campaign_id = request.body.campaign_id;
		console.log("resetCampaignCounter - campaign_id = " + campaign_id); 
		// get all campaigns
		var campaigns = getCampaigns();	
		if (campaigns) {
			// find the relevant campaign and reset the total counter and counter for users
			campaigns.forEach(function(campaign) {
				if (campaign_id == campaign.id) {
					// reset the campaign counters
					campaign.counter = 0;
					campaign.usersSawThisCampaign = {};
				}
			})
		}
		cache.put('campaigns', campaigns);
		response.send(campaigns);
	});

	function getCampaigns() {
		var allCampaigns = cache.get('campaigns');			
		if (allCampaigns == null) {	
			console.log('put campaigns in cache');
			cache.put('campaigns', campaigns);
			allCampaigns = campaigns;
		}	
		return allCampaigns;
	}

	

	/* handle errors */
	app.use(function (err, request, response, next) {
		console.error(err.stack)
		response.status(500).send('Something broke!')
	})


	/* Get all campaigns for user by user_id */
	function getCampaignsForUser(user_id, campaigns) {
		console.log('start getCampaignsForUser with User Id: ' + user_id);
		if (!campaigns || !user_id) {
			return [];
		}
		var userCampaigns = [];
		// add all campaigns that did not reach the maximum for the general counter & total per user counter
		campaigns.forEach(function(campaign) {
			console.log('campaign = ' + campaign + '; campaign.counter = ' + campaign.counter + '; max_total = ' + campaign.thresholds.max_total);
			// check the max_total
			if (campaign.counter < campaign.thresholds.max_total) {
				console.log('counter has not reached to max');
				var userSawCampaignCounter = campaign.usersSawThisCampaign[user_id];
				userSawCampaignCounter = userSawCampaignCounter ? userSawCampaignCounter : 0;

				// check the max_per_user
				if (userSawCampaignCounter < campaign.thresholds.max_per_user) {
					console.log('push campaign id ' + campaign.id + ' to userCampaigns');
					userCampaigns.push(campaign);
					campaign.counter++;
					campaign.usersSawThisCampaign[user_id] = userSawCampaignCounter + 1;
				}
			}
		});
		return userCampaigns;
	}

}