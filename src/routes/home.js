// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js');

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

	var Articles =  cfDB.articlesmodel;
	Articles
	.find({})
	.sort({'date': -1})
	.limit(9)
	.exec(function (err, articles) {
			if(articles) {
				console.log("Found articles", articles);
			    response.render('forum_news', {articles: articles});
			} else {
				console.log('Nothing found for Articles!');
				response.render('forum_news');
			}
		});
});

/* GET news page. */
router.get('/news/:articleID', function(request, response) {
   response.render('forum_news_details');
});

module.exports = router;