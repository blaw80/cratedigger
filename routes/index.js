var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Music Box' });
});

// Get findsong page
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

router.get("/delete/:id", function(req, res){
   var db = req.db;
   var collection = db.get('musiccollection');
   var songId = req.params.id;

//   delete from database with this function: remove({}, fn)
    collection.remove({"_id": songId}, function(e){
        if (e) {res.send("There was a problem deleting from the database.");}
     //   else {res.send("delete confirmed");}        
        collection.find({}, {}, function(e,docs){
            res.render('admin', {
            "library" : docs
        });             
        });
    });
});

router.get("/edit/:id", function(req, res){
    var db = req.db;
    var collection = db.get('musiccollection');
// get _id value from req url parameter
    var songId = req.params.id;

// use findOne to select from database with songId
    collection.findOne({"_id": songId}, function(e, docs){
        var songName = docs.songtitle;
        var artistName = docs.artist;
        var songUrl = docs.url;

        res.render("edit", {title: "edit track details", song:songName, artist:artistName, url:songUrl, id: songId});
    });
});

router.post("/updated/:id", function(req, res){
    var db = req.db;
    var collection = db.get('musiccollection');
    var songId = req.params.id;
    var songName = req.body.songname;
    var artistName = req.body.artistname;
    var songUrl = req.body.songurl;

// update docs with songId
        collection.update({_id: songId},{$set: {url: songUrl}},function (err, doc) {
        if (err) {res.send("There was a problem adding the information to the database.");}

// *** IMPORTANT*** i never finished writing the lines here that would update songtitle, or artist
// this function only works to update the url field

        else {res.redirect("/admin");}
        });
});

/* GET New Song & Post to Library page. */
router.get('/newsong', function(req, res) {
    res.render('newsong', { title: 'Add New Song' });
});

router.post('/addsong', function(req, res) {
    // Set our internal DB variable
    var db = req.db;
    var collection = db.get('musiccollection');
    // Get our form values. These rely on the "name" attributes
    var songName = req.body.songname;
    var artistName = req.body.artistname;
    var songUrl = req.body.songurl;

    // Submit to the DB
    collection.insert({
        "songtitle" : songName,
        "artist" : artistName,
        "url" : songUrl
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // on success set the address bar to library
            //res.location("successLibrary");
            // And forward to success page
            res.redirect("admin");
        }
    });
});

module.exports = router;