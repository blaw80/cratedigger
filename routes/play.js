var express = require('express');
var router = express.Router();
var Playlist = require('../models/playlist');
var Track = require('../models/track');

// check for authentication and call next or redirect
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
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
    res.redirect('/play');
};

router.delete('/deletetrack/:id', isAuthenticatedPrivileged, function(req, res){
   
   Track.findByIdAndRemove(req.params.id, function(err){
        res.send((err===null) ? {msg: ''} : {msg: 'error: ' +err});       
   });
});

router.post('/addtrack', isAuthenticated, function(req, res){
    
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
 
});

router.post('/saveplaylist', isAuthenticated, function(req, res) {
    
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