var express = require('express');
var router = express.Router();

module.exports = function(passport){
 
  /* GET login page. */
  router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('index', { title: 'Mixtape', message: req.flash('message') });
  });
 
  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/play',
    failureRedirect: '/',
    failureFlash : true 
  }));
 
  /* GET Registration Page */
  router.get('/signup', function(req, res){
    res.render('register',{message: req.flash('message')});
  });
 
  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/play',
    failureRedirect: '/signup',
    failureFlash : true 
  }));
  
  /* Handle Logout */
router.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});
 
  return router;
};
