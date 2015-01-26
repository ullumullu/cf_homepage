/*=============================================
=            Routes for Public Page           =
=============================================*/

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('home.js');

// External dependencies
var express = require('express'),
    router = express.Router();

// Dependencies to libs
var routesutil = require('./routesutil.js');
var cfDB = require('../lib/ForumDB.js');

/*==========  Landing page  ==========*/

/* GET home page. */
router.get('/', function (req, res) {
	res.render('forum_home');
});

/**
 * Used for facebookintegration. Provides the corresponding controller
 * with the required UserAccesstToken.
 * @param  {Object} req  Request object
 * @param  {Object} res Response object
 */
router.get('/oauthcallback', function (req, res) {
	res.render('oauthcallback');
})

/*==========  Newsarticles API  ==========*/

/* GET news page. */
router.get('/newsarticles', function (req, res) {

	var articles_before = req.query.date || new Date();
	var newerArticles = req.query.newer === "true";
	var limit = req.query.limit || 3;

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
				 res.json(articles);			  
			} else {
				console.log('Nothing found for Articles!');

			}
		});
});

/* GET news page. */
router.get('/newsarticles/:articleID', function (req, res) {

	var id = req.params.articleID;


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
				 res.json(article[0]);			  
			} else {
				console.log('Nothing found for Articles!');
			}
		});
});

/*==========  Members API  ==========*/

router.get('/members', function (req, res) {
	 var membersModel =  cfDB.membersmodel;
   membersModel.find({visible: true})
   .exec(function (err, members) {
         if(!err) {
            if(members) {
                routesutil.sendJson(req, res, {members: members});
            } else {
               res.status(404);
               routesutil.sendJson(req, res, {members: members});
            }
         } else {
            res.status(500);
            routesutil.sendJson(req, res, 
               {
                  status: "Ups... something bad happened...",
                  err: err
               });
         } 
      });
});

/*==========  Rent API  ==========*/

var gcal = new (require('../lib/Calendar/GoogleCalendar.js')).GoogleCalendar(config.gcal.email, config.gcal.keyFile, config.gcal.calendarId);

router.get('/calendar', function (req, res) {
  var _METHOD = "GET /calendar";
  logging.debug("Entering " + _METHOD);
  gcal.getCalendar(true, function(err, data) {
    res.send(data);
  });
});

router.post('/calendar', function (request, res) {
  var _METHOD = "POST /calendar";
  logging.debug("Entering " + _METHOD);


});

module.exports = router;
/*-----  End of Routes for Public Page  ------*/