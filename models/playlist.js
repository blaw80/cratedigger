var mongoose = require('mongoose');

var trackSchema = {song: String, url: String};

module.exports = mongoose.model('Playlist',{
        creator: String,
        name: String,
        tracks: [trackSchema],
        stars: Number
});
