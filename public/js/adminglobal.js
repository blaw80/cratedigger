(function init(){    
    var trackData = [];
    
    $(document).ready(function(){
    populateTable();
    
    //click listener for  info button
    $('#songList table tbody').on('click', 'td a.infobutton', showTrack);

    
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
            alert("show track");
            // get path /admin/trackinfo/:id
            var thisTrackId = $(this).attr('rel');

            var arrayPosition = trackData.map(function(arrayItem){return arrayItem.username;}).indexOf(thisTrackId);

            var thisTrackObject = trackData[arrayPosition];
            
            $('#userInfoName').text(thisTrackObject.songtitle);
        }    
    
}());

