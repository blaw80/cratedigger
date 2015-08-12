(function init(){    
    var trackData = [];
    
    $(document).ready(function(){
        
        populateTable();
    //click listeners for info & edit button
        $('#songList table tbody').on('click', 'td a.infobutton', showTrack);
        $('#songList table tbody').on('click', 'td a.addtoplaylist', addToPlaylist);
        $('#trackInfo p').on('click', 'a.editbutton', editTrack);
        $('#trackInfo p').on('click','a.deletebutton', deleteTrack);
        $('#editTrackForm').on('click', 'button#submitEdit', displayUpdated);
        $('#editTrackForm').on('click', 'button#cancelEdit', cancelEdit);
        $('#addTrack').on('click', addTrack);
        $('#editTrackForm').on('click', 'button#submitNewTrack', writeNewTrack);
        $('#editTrackForm').on('click', 'button#cancelAdd', cancelAdd);
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
                tableContent += '<td><a href="#" class="infobutton" rel="' + this._id + '">info</a></td>'
                tableContent += '<td><a href="#" class="addtoplaylist" rel="' + this._id + '">+</a></td>'
                ;
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
            $('#deleteTrackBtn').html('<a href="#" class="deletebutton rel="'+thisTrackObject._id + '">Delete Track</a>');
            $( '#editTrackForm' ).empty();
        }    
    
        function editTrack(event){
            event.preventDefault();
            
            var thisTrackId = $(this).attr('rel');  
            
            // this time instead of fetching track details from our cached array, we will query the db 
            // call /trackinfo/:id route on admin.js
            $.getJSON("/admin/trackinfo/"+thisTrackId, function(data){
                // use jquery to replace #trackInfo div with a form

                var editFormString = '<form id="formEditSongFields" name="editSong">'+
                '<input id="editSongTitle" type="text" name="songname" value="' + data.songtitle +'">' + 
                '<input id="editArtist" type="text" name="artistname" value="' +data.artist +'">' +
                '<input id="editUrl" type="text" name="songurl" value="' + data.url +'">' +
                '<button id="submitEdit" type="button" data-id="'+data._id+'">save changes</button><button type="button" id="cancelEdit">cancel</button></form>';

                $('#editTrackForm').html(editFormString);            
            });            
        }
        
        function cancelEdit(event){
            event.preventDefault();
            $('#editTrackForm').empty();
        }
        function cancelAdd(event){
            event.preventDefault();
            $('#editTrackForm').empty();
        }    
        
        function displayUpdated(event){
            event.preventDefault();
            var editedTrackInfo = { 'songtitle': $('#editTrackForm input#editSongTitle').val(),
                                'artist': $('#editTrackForm input#editArtist').val(),
                                'url': $('#editTrackForm input#editUrl').val() };
            var songId = $('#editTrackForm button#submitEdit').attr('data-id');
            
            //post JSON data to collection & then run populateTable() to show updated info
            $.ajax({
                type: 'PUT',
                data: editedTrackInfo,
                url: '/admin/updated/'+songId,
                dataType: 'JSON'
            }).done(function(response){
                
              if (response.msg === '')  {
                  $('#trackInfoName').text(editedTrackInfo.songtitle);
                  $('#trackInfoArtist').text(editedTrackInfo.artist);
                  $('#trackInfoUrl').text(editedTrackInfo.url);
                  $('#editTrackForm').empty();
                  populateTable();
              }
              else {alert('error'+ response.msg);}
            });
        }
        
        function deleteTrack(event){
            event.preventDefault();
            var confirmation = confirm("are you sure you want to delete this track?");
            var thisTrackId = $('#trackInfoId').text();

            if (confirmation === true){
                $.ajax({
                    type: 'DELETE',
                    url: '/admin/deletetrack/'+ thisTrackId
                }).done(function(response){
                    if (response.msg ===''){}
                    else {alert('error: '+ response.msg);}
                    populateTable();
                });
            }
            else {return false}
            }

        function addTrack(event){
            event.preventDefault();
            $('#editTrackForm').empty();
            var addTrackString = '<p>Add track details here</p><form id="addTrackForm" name="addsong">'+
                '<input id="addSongTitle" type="text" name="songname" placeholder="song title">' + 
                '<input id="addArtist" type="text" name="artistname" placeholder="artist">' +
                '<input id="addUrl" type="text" name="songurl" placeholder="url">' +
                '<button id="submitNewTrack" type="button">save changes</button><button type="button" id="cancelAdd">cancel</button></form>';
            $('#editTrackForm').html(addTrackString);
        }
        
        function writeNewTrack(event){
            event.preventDefault();
            var newTrackInfo = {'songtitle': $('#addSongTitle').val(),
                                'artist': $('#addArtist').val(),
                                'url': $('#addUrl').val()};
            $.ajax({
                type: 'POST',
                url: '/admin/addtrack',
                dataType: 'JSON',
                data: newTrackInfo
            }).done(function(response){
                if (response.msg ===''){
                    populateTable();
                    $('#editTrackForm').empty();
                }
                    else {alert('error: '+ response.msg);}
            });
        }
        
        function addToPlaylist(event){
            event.preventDefault();
            
            // get id from link rel
            var thisTrackId = $(this).attr('rel');
            
            var arrayPosition = trackData.map(function(arrayItem){return arrayItem._id;}).indexOf(thisTrackId);
            var thisTrackObject = trackData[arrayPosition];
            
            var audio = $("#audio");      
            $("#audiosource").attr("src", thisTrackObject.url);
            /****************/
            audio[0].pause();
            audio[0].load();//suspends and restores all audio element
            audio[0].play();
            /****************/
            $('#playlist ul').prepend("<li>" + thisTrackObject.songtitle +", "+thisTrackObject.artist + "</li>");
        }
        
}());

