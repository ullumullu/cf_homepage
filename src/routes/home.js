/*=============================================
=            Routes for Public Page           =
=============================================*/

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js');
// Init express and the router
var express = require('express');
var router = express.Router();
// Dependencies to libs
var routesutil = require('./routesutil.js');
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
router.get('/newsarticles', function(request, response) {

	var articles_before = request.query.date || new Date();
	var newerArticles = request.query.newer === "true";

	var querySymb = (newerArticles) ? '$gt' : '$lt';

	var action = {};
	action[querySymb] = articles_before;
	action['$lte'] = new Date();

	if(config.logging === 'debug') {
	   console.log('DEBUG: '+querySymb);
	} 

	var Articles =  cfDB.articlesmodel;
	Articles
	.find({ published: action, status: 'Published'} )
	.sort({'published': -1})
	.limit(3)
	.lean()
	.exec(function (err, articles) {
			if(articles) {
				console.log("Found articles");
				 response.json(articles);			  
			} else {
				console.log('Nothing found for Articles!');

			}
		});
});

module.exports = router;
/*-----  End of Routes for Public Page  ------*/