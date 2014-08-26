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

  var from = request.query.from;
  var to = request.query.to;
    
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
  var newArticle = new articlesModel(body.article); 
  
  // And store it into the DB
   newArticle.save(function(err, newArticle) {
      if(!err) {
          var id = newArticle._id;
          var image = body.image;
          
          if(image) {
            storeImage(id, image);  
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

/**
* And this is an update 
*/
router.put('/articles/:articleID', function(request, response) {
   var body = request.body;
   var id = request.params.articleID;
   var image = body.image;
   
   if(image) {
    storeImage(id, image);  
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
  var id = request.params.articleID;
  var filePath = './src/public/img/articles/'+id+'.png';
  var fs = require('fs');

  if(config.logging === 'debug') {
     console.log('DEBUG: Delete ID '+ id);
  } 
  
  var articlesModel =  cfDB.articlesmodel;
  articlesModel.remove({ _id: request.params.articleID}, function (err) {
    if(!err) {

      fs.unlink(filePath, function(err) {
        if(config.logging === 'debug') {
           console.log('DEBUG: '+ err);
        } 
      });

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

/*==========  Helper Methods  ==========*/

function storeImage(id, image) {
  var filePath = './src/public/img/articles/'+id+'.png';
  var fs = require('fs');
  
  if(image == 'clear') {
    fs.unlink(filePath, function(err) {
      if(config.logging === 'debug') {
         console.log('DEBUG: '+ err);
      } 
    });
  } else if(image.indexOf('data:image')>-1) {
    var base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(filePath, base64Data , 'base64', function(err) {
      console.log(err); // writes out file without error, but it's not a valid image
    });
  }
}

module.exports = router;
/*-----  End of Articles API  ------*/
