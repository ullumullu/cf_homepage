var express = require('express');
var router = express.Router();

var cfDB = require('../lib/ForumDB.js');

/* GET home page. */
router.get('/', function(request, response) {
	var homeModel =  cfDB.homemodel;
		homeModel.find({}, function (err, home) {
			if(home[0]) {
			    
			    var body = home[0];
			    response.render('forum_home', body);
			} else {
				console.log('Nothing found for Home!');
			}
		});

});

/* GET news page. */
router.get('/news', function(request, response) {
   response.render('forum_news');
});

/* GET news page. */
router.get('/news/:articleID', function(request, response) {
   response.render('forum_news_details');
});

module.exports = router;