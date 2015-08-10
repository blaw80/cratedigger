var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('musiccollection');
    collection.find({}, {}, function(e,docs){
        res.render('admin', {
            "library" : docs
        });             
    });
});

// this gets called on pageload via AJAX request in adminglobal.js, sending all db collection info to be cached in an array
router.get('/tracklist', function(req, res) {
    var db = req.db;
    var collection = db.get('musiccollection');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

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

router.post('/updated/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('musiccollection');

    collection.update({ '_id': req.params.id },{ $set: {songtitle: req.body.songtitle, artist: req.body.artist, url: req.body.url} }, function(err){
        res.send(
            (err === null) ? {msg: ''} : {msg: err}
            );
    });
    
    
    
// console.log(req.body.songtitle);
 // res.send("edits submitted");
  // respond with success? or respond with updated JSON?    
    
});

module.exports = router;
