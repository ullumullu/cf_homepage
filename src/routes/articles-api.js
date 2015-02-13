/*=============================================
=            Articles API                    =
=============================================*/

/**
 * Admin site api thats used to manage all articles written for
 * the club forum page. Allows to insert, update and delete an 
 * article.
 *
 * :TODO: Maybe it would be nice to interact with multiple articles 
 * at a time. 
 */

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('articles-api.js');

// External dependencies
var express = require('express'),
    router = express.Router();

// Dependencies to libs
var routesutil = require('./routesutil.js'),
    cfDB = require('../lib/ForumDB.js');

// Private variables
var _articleimglocation = config.paths.articles;


/**
 * Get method which retrieves all articles stored. The default
 * ordering is from the newest to the oldest created article.
 * 
 * @param  {Object} request
 * @param  {Object} response
 */
router.get('/articles', function(request, response) {
 
  var _METHOD = "GET /articles";
  logging.debug("Entering " + _METHOD);
 
  var articlesModel =  cfDB.articlesmodel;
  articlesModel.find({})
  .sort({'date': -1})
  .exec(function (err, articles) {
    if(!err) {
      if(articles) {
        routesutil.sendJson(request, response, {articles: articles});
      } else {
        response.status(404);
        routesutil.sendJson(request, response, {articles: articles});
      }
   } else {
      response.status(500);
      routesutil.sendJson(request, response, 
        {
          status: "Ups... something bad happened...",
          err: err
        });
    } 
  });
});

/**
* Place a new article into the DB
*/
router.post('/articles', function(request, response) {

  var _METHOD = "POST /articles";
  logging.debug("Entering " + _METHOD);

  var body = request.body;

  // Ceate the new document
  var articlesModel =  cfDB.articlesmodel;
  var newArticle = new articlesModel(body.article); 
  
  // And store it into the DB
   newArticle.save(function(err, newArticle) {
      if(!err) {
          var id = newArticle._id;
          var image = body.image;
          
          if(image) {
            routesutil.storeImage(id, image, _articleimglocation);  
          }

         response.status(200);
          response.set({
               'Content-Type': 'application/json',
               'Cache-Control': 'no-cache'
            });
         // :TODO: Strip down to the essentials!
         routesutil.sendJson(request, response, newArticle);
      } else {
         response.status(500);
          response.set({
               'Content-Type': 'application/json',
               'Cache-Control': 'no-cache'
            });   
          routesutil.sendJson(request, response, 
            {
             status: "Ups... something bad happened...",
             err: err
            }); 
      }
   });
});

/*
* And this is an update 
*/
router.put('/articles/:articleID', function(request, response) {
  
  var _METHOD = "PUT /articles/:articleID";
  logging.debug("Entering " + _METHOD);
  
  var body = request.body;
  var id = request.params.articleID;
  var image = body.image;

  if(image == 'clear' ) {
    routesutil.deleteImage(id, _articleimglocation);
  }else if(image) {
    routesutil.storeImage(id, image, _articleimglocation);  
  }

  var articlesmodel =  cfDB.articlesmodel;
  articlesmodel.findByIdAndUpdate(id, body.article, function (err, updatedArticle) {      
    if(updatedArticle) {
          response.status(200);
                response.set({
                     'Content-Type': 'application/json',
                     'Cache-Control': 'no-cache'
                  });
          routesutil.sendJson(request, response, updatedArticle);
      } else {
         response.status(500);
          response.set({
               'Content-Type': 'application/json',
               'Cache-Control': 'no-cache'
            });   
          routesutil.sendJson(request, response, {status:"ERROR UPDATE"});
      }
   });
});

router.delete('/articles/:articleID', function(request, response) {
  
  var _METHOD = "DELETE /articles/:articleID";
  logging.debug("Entering " + _METHOD);

  var id = request.params.articleID;
  logger.debug('%s: Delted article with Id %s', _METHOD, id);
  
  var articlesModel =  cfDB.articlesmodel;
  articlesModel.remove({ _id: request.params.articleID}, function (err) {
    if(!err) {

      // Delete the image if there is one
      routesutil.deleteImage(id, _articleimglocation);

       response.status(200);
        response.set({
          'Status': 'OK'
        });
        response.send();
    } else {
       response.status(404);
        response.set({
          'Status': 'File not found yo!'
        });
        response.send();
    }
  });

});

module.exports = router;
/*-----  End of Articles API  ------*/
