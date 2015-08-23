var mongoose = require('mongoose');

var starredSchema = {playlistName: String};
 
module.exports = mongoose.model('User',{
        username: String,
    password: String,
    email: String,
    starred: [starredSchema]
});
