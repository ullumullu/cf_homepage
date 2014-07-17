/*=============================================
=            Articles API                    =
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

/**
* Get all articles
*/
router.get('/articles', function(request, response) {
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
   var body = request.body;
   // Ceate the new document
   var articlesModel =  cfDB.articlesmodel;
   var newArticle = new articlesModel(body);
   // And store it into the DB
   newArticle.save(function(err, newArticle) {
      if(!err) {
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


/**
* And this is an update 
*/
router.put('/articles/:articleID', function(request, response) {
   var body = request.body;
   console.log(body);
   var id = request.params.articleID;

   var articlesmodel =  cfDB.articlesmodel;
   articlesmodel.findByIdAndUpdate(id, body, function (err, updatedArticle) {
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
    console.log("ID " + request.params.articleID);
   

    var articlesModel =  cfDB.articlesmodel;
   articlesModel.remove({ _id: request.params.articleID}, function (err) {
      if(!err) {
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
