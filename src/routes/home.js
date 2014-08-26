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
router.get('/', function (request, response) {
	response.render('forum_home');
});

router.get('/oauthcallback', function (request, response) {
	response.render('oauthcallback');
})

/* GET news page. */
router.get('/newsarticles', function (request, response) {

	var articles_before = request.query.date || new Date();
	var newerArticles = request.query.newer === "true";
	var limit = request.query.limit || 3;

	var querySymb = (newerArticles) ? '$gt' : '$lt';
	var sortorder = (newerArticles) ? 1 : -1;

	var action = {};
	action[querySymb] = articles_before;
	action['$lte'] = new Date();

	if(config.logging === 'debug') {
	   console.log('DEBUG: '+querySymb);
	} 

	var Articles =  cfDB.articlesmodel;
	Articles
	.find({ published: action, status: 'Published'} )
	.sort({'published': sortorder})
	.limit(limit)
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

/* GET news page. */
router.get('/newsarticles/:articleID', function (request, response) {

	var id = request.params.articleID;


	if(config.logging === 'debug') {
	   console.log('DEBUG: '+id);
	} 

	var Articles =  cfDB.articlesmodel;
	Articles
	.find({ _id: id} )
	.lean()
	.exec(function (err, article) {
			if(article) {
				console.log("Found article");
				 response.json(article[0]);			  
			} else {
				console.log('Nothing found for Articles!');
			}
		});
});


module.exports = router;
/*-----  End of Routes for Public Page  ------*/