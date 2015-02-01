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
var mailUtil = require('../lib/mailing.js');


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

/* GET article page. */
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

/* Current members of the CF */
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

router.post('/calendar', function (req, res) {
  var _METHOD = "POST /calendar";
  logging.debug("Entering " + _METHOD);

  var body = req.body;
  var inputIsValid = validateCalendarInput(body);
  if(inputIsValid) {
    if(config.email.enabled) {
      // TODO Refactor into separate file
      // Send mail to requester
      mailUtil.sendMail(
        "club.forum.bb@gmail.com",
        body.email,
        "Bestätigung Anfrage für " + body.name + " am " + body.date,
        "Hallo " +  body.name + ",<br>Deine Anfrage ist bei uns eingegangen, sobald wir deine Anfrage bearbeitet haben melden wir uns bei dir!<br>Dein Club Forum Team!",
        "<p>Hallo " +  body.name +",</p>"+
        "<p>Deine Anfrage ist bei uns eingegangen, sobald wir deine Anfrage bearbeitet haben melden wir uns bei dir!</p>"+
        "<p>Dein Club Forum Team!</p>",
        []
        );
      // Send mail to club forum bb
      mailUtil.sendMail(
        body.email,
        "club.forum.bb@gmail.com",
        "Anfrage von " + body.name + " für den " + body.date,
        "Aktiviere HTML Ansicht...",
        "<p>Anfrage Vermietrung Club Forum für den " +  body.date +"</p>"+
        "<table><tr><td>Name:</td><td>"+body.name+"</td></tr><tr><td>E-Mail:</td><td>"+body.email+"</td></tr><tr><td>Details:</td><td>"+body.request+"</td></tr></table>",
        []
        );
    }

    // Ceate the new document
    var rentModel =  cfDB.rentmodel;
    var newRent = new rentModel(body); 
    
    // And store it into the DB
    newRent.save(function(err, newRent) {
      if(!err) {
        res.status(200);
        routesutil.sendJson(req, res, 
         {
            status: "ok"
         });
      } else {
        logging.error("Failed to store rent request. Error: ", err);
        res.status(500);
        routesutil.sendJson(req, res, 
         {
            status: "Ups... something bad happened...",
            err: err
         });
      }
    });
  } else {
    res.status(403);
    routesutil.sendJson(req, res, 
     {
        status: "Ups... something bad happened..."
     });
  }

});

function validateCalendarInput(body) {
  var currentDate = new Date();
  var selectedDate = new Date(body.date);
  logging.debug("currentDate ", currentDate, " selectedDate " , selectedDate); 
  if(+selectedDate >= +currentDate) {
    return true;
  }
  return false;
}

module.exports = router;
/*-----  End of Routes for Public Page  ------*/