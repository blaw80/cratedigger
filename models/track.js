var mongoose = require('mongoose');
 
module.exports = mongoose.model('Track',{
        songtitle: String,
    artist: String,
    url: String
});