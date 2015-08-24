var express = require('express');
var router = express.Router();
var Playlist = require('../models/playlist');
var Track = require('../models/track');
var User = require('../models/user');

// check for authentication and call next or redirect
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
    res.send({msg: "0"});
};

router.get('/', function(req, res){
  res.render('play', { user: req.user });
});


// this gets called on pageload via AJAX request in global.js, sending all db collection info to be cached in an array
router.get('/tracklist', function(req, res) {
    
    Track.find({}, function(err, docs){
        if (!err){
            res.json(docs);
        }
        else {throw err}
    });
   
});

/*
// use this router to fetch individual track info from db for edit function
router.get('/trackinfo/:id', function(req, res){
    var db = req.db;
    var collection = db.get('musiccollection');
    //find entry where _id === :id
    collection.findOne({'_id': req.params.id}, function(e,docs){
        
    // send json response
    res.json(docs);
    });
});
*/

// router for accepting data from edit form and writing to db
router.put('/updated/:id', isAuthenticated, function(req, res) {

   Track.findOne({ _id: req.params.id }, function(err, docs){
        if (!err){
            docs.songtitle = req.body.songtitle;
            docs.artist = req.body.artist;
            docs.url = req.body.url;
            docs.save();
            res.send({msg:''});
        }
        else {throw err}
    });
});

var isAuthenticatedPrivileged = function (req, res, next) {
  if (req.user.username === 'boo')
    return next();
    res.send({msg: "0"});
};

router.delete('/deletetrack/:id', isAuthenticatedPrivileged, function(req, res){
   
   Track.findByIdAndRemove(req.params.id, function(err){
        res.send((err===null) ? {msg: ''} : {msg: 'error: ' +err});       
   });
});

router.post('/addtrack', isAuthenticated, function(req, res){
    
    Track.findOne({url: req.body.url}, function (err, docs){
        if(!err){
            if (docs){
                console.log('that url is already in db');
                return res.send({msg: 'dupe'});
            }
            else{
                var newTrack = new Track();
                    newTrack.songtitle = req.body.songtitle;
                    newTrack.artist = req.body.artist;
                    newTrack.url = req.body.url;
                        
                    newTrack.save(function(err) {
                            if (err){
                                return res.send({msg: err});  
                            }
                            console.log('track save success');    
                            return res.send({msg: ''});
                            });               
            }
        }
        else{throw err}
    });
    
});

router.post('/saveplaylist', isAuthenticated, function(req, res) {
    
    //need to write code that explains these errors to the user
    
   Playlist.findOne({ 'name' :  req.body.name }, function(err, playlist) {
                    if (err){
                        console.log('Error saving playlist '+err);
                        return (err);
                    }
                    // already exists
                    if (playlist) {
                        console.log('Playlist already exists with name: '+req.body.name);
                        return (null);
                    } else {
                        var newPlaylist = new Playlist();
        
                        newPlaylist.name = req.body.name;
                        newPlaylist.creator = req.user.username;
                        newPlaylist.tracks = req.body.tracks;
                        
                        newPlaylist.save(function(err) {
                            if (err){
                                return res.send({msg: err});  
                            }
                            console.log('playlist save success');    
                            return res.send({msg: ''});
                            });
                        }
            }); 
    });

router.get('/playlists', function(req, res) {
    
        Playlist.find({}, function(err, docs){
        if (!err){
            res.json(docs);
        }
        else {throw err}
    });
});

router.get('/loadplaylist/:id', function(req, res) {
    
            Playlist.findOne({_id: req.params.id}, function(err, docs){
                if(!err){
                res.json(docs);
                }
                else {throw err}
            });
});

router.post('/starplaylist/:playlist', isAuthenticated, function(req, res) {
    
    // if req.user.starred contain req.params.playlist -> return and send error
    var beenStarred = false;
    for (var i = 0; i < req.user.starred.length; i++){
                
        if (req.user.starred[i].playlistName === req.params.playlist) {return beenStarred = true}       
        
    }
        if (!beenStarred)
            {    
                User.findOne({username: req.user.username}, function(err, user) {
                    if (!err){
                        
                        user.starred.push({ playlistName: req.params.playlist});         
                        user.save(function(err){
                            if (err){
                                return res.send({msg: err});  
                            }
                            console.log('starred success');    
                            return res.send({msg: ''});
                            });
                    }
                    else {return res.send({msg: '0'});}
                });
                
                Playlist.findOne({name: req.params.playlist}, function(err, playlist){
                  if (!err){
                      
                     if (playlist === null) { return }
                      
                    if (playlist.stars===undefined){playlist.stars = 1;}  
                    else {playlist.stars += 1;}
                    
                    playlist.save(function(err) {
                            if (err){
                                return res.send({msg: err});  
                            }
                            console.log('starred success');    
                            return res.send({msg: ''});
                            });  
                  }
                });
            }
            else {res.send({msg: 'you already starred this track'})}
});

/* add in router for search function

router.get("/findsongs", function(req, res){
    res.render("findsongs", {title: "Search for music"});
});

router.post("/searchresult", function(req, res){
    var db = req.db;
    var collection = db.get('musiccollection');
    var searchSong = req.body.songname;
    var searchArtist = req.body.artistname;
    // query the collection for the search terms and return results
    // var foundSoungs = collection.find({},{}, function(e,docs){ /render page with supplied results/});
    res.render("searchresult", {searchterms: searchSong + " - " + searchArtist});
});
*/

module.exports = router;