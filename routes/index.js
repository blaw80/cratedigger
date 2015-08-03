var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Music Box' });
});

/* GET library page. */
router.get('/library', function(req, res) {
    var db = req.db;
    var collection = db.get('musiccollection');
    collection.find({}, {}, function(e,docs){
        res.render('library', {
            "library" : docs
        });             
    });
});

// Get findsong page
router.get("/findsongs", function(req, res){
    res.render("findsongs", {title: "Search for music"});
});

router.post("/searchresult", function(req, res){
    var db = req.db;
    var searchSong = req.body.songname;
    var searchArtist = req.body.artistname;
    var collection = db.get('musiccollection');
    // query the collection for the search terms and return results
    // var foundSoungs = collection.find({},{}, function(e,docs){ /render page with supplied results/});
    res.render("searchresult", {searchterms: searchSong + " - " + searchArtist});
});

router.get("/delete", function(req, res){
   var db = req.db;
   var collection = db.get('musiccollection');
   res.render("'delete");
});

router.get("/edit", function(req, res){
    //get song id
    //display database entry
    //display empty field
    //
    
});
router.post("/updated", function(req, res){
    //fetch collection and form info
    //go through each field and if it is not empty write it to db
    //if no error redirect to library
})


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
            // If it worked, set the header so the address bar doesn't still say /adduser
            //res.location("userlist");
            // And forward to success page
            res.redirect("library");
        }
    });
});

module.exports = router;