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

router.get('/tracklist', function(req, res) {
    var db = req.db;
    var collection = db.get('musiccollection');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});
/*
router.get('trackinfo/:id', function(req, res){
    var db = req.db;
    var collection = db.get('musiccollection');
    //find entry where _id === :id
    // send json response
    
});
*/


module.exports = router;
