var express = require('express');
var router = express.Router();

module.exports = function(passport){
 
  /* GET login page. */
  router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('index', { title: 'Music Box', message: req.flash('message') });
  });
 
  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/admin',
    failureRedirect: '/',
    failureFlash : true 
  }));
 
  /* GET Registration Page */
  router.get('/signup', function(req, res){
    res.render('register',{message: req.flash('message')});
  });
 
  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/admin',
    failureRedirect: '/signup',
    failureFlash : true 
  }));
 
  return router;
};


/*
var express = require('express');
var router = express.Router();

// GET home page. /
router.get('/', function(req, res) {
    res.render('index', { title: 'Music Box' });
});



module.exports = router;
*/