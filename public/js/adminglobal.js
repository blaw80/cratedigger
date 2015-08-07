(function init(){    
    var trackData = [];
    
    $(document).ready(function(){
        
        populateTable();
    //click listeners for info & edit button
        $('#songList table tbody').on('click', 'td a.infobutton', showTrack);
        $('#trackInfo p').on('click', 'a.editbutton', editTrack);
    
    });

        function populateTable() {

            var tableContent = '';
            $.getJSON( '/admin/tracklist', function( data ) {
            trackData = data;
        // For each item in our JSON, add a table row and cells to the content string
            $.each(data, function(){
                tableContent += '<tr>';
                tableContent += '<td>'+this.songtitle + '</td>';
                tableContent += '<td>' + this.artist + '</td>';
                tableContent += '<td><a href="#" class="infobutton" rel="' + this._id + '">info</a></td>';
                tableContent += '</tr>';
            });
        // Inject the whole content string into our existing HTML table
            $('#songList table tbody').html(tableContent);
            });
        }

        function showTrack(event){
            event.preventDefault();

            // get id from link rel
            var thisTrackId = $(this).attr('rel');
            
            var arrayPosition = trackData.map(function(arrayItem){return arrayItem._id;}).indexOf(thisTrackId);
            var thisTrackObject = trackData[arrayPosition];
            
            $('#trackInfoName').text(thisTrackObject.songtitle);
            $('#trackInfoArtist').text(thisTrackObject.artist);
            $('#trackInfoUrl').text(thisTrackObject.url);
            $('#trackInfoId').text(thisTrackObject._id);
            $('#editTrack').html('<a href="#" class="editbutton" rel="'+ thisTrackObject._id + '">Edit Track Details</a>');
        }    
    
        function editTrack(event){
            event.preventDefault();
            
            //grab _id value from link rel
            var thisTrackId = $(this).attr('rel');  
            
            // this time instead of fetching track details from our cached array, we will query the db 
            // call /trackinfo/:id route on admin.js
            $.getJSON("/admin/trackinfo/"+thisTrackId, function(data){
                // use jquery to replace #trackInfo div with a form
                // $("data to be inserted").replaceAll("#targetelement");
                var trackName = data.songtitle;
                $("<p>"+data.songtitle+"</p>").replaceAll("#editTrackForm p");
                // action = <router to update track info in db>
                // inputs for songtitle, artist, & url
                // button type=submit for save changes ... btn id?
                
                //alert("this track is" + data.songtitle);
            });            
            
        }
    
}());

