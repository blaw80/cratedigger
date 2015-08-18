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
                tableContent += '<td><a href="#" class="infobutton" rel="' + this._id + '">info</a></td>';
                tableContent += '<td><a href="#" class="addtoplaylist" rel="' + this._id + '">+</a></td>';
                tableContent += '</tr>';
            });
        // Inject the whole content string into our existing HTML table
            $('#songList table tbody').html(tableContent);
       
            paginate();
            });
        }

function paginate(){
      var show_per_page = 12;
      var number_of_items = $('#songList tbody tr').length;
      var number_of_pages = Math.ceil(number_of_items/show_per_page);

      var navigation_html = '<a class="previous_link" href="#">Prev</a>';
      var current_link = 1;
      while(number_of_pages >= current_link){
          navigation_html += '<a class="page_link" href="#" data-pageNumber="'+ current_link +'">'+ (current_link) +'</a>';
          current_link++;}
          
      navigation_html += '<a class="next_link" href="#">Next</a>';
      $('#page_navigation').html(navigation_html);
      $('#page_navigation .page_link:first').addClass('active_page');
      $('#songList tbody tr').css('display', 'none');
      $('#songList tbody tr').slice(0, show_per_page + 1).css('display', '');

  function previous(event){
      event.preventDefault();
      var new_page = $('.active_page').attr('data-pageNumber') - 1;
      //if there is an item before the current active link run the function
      if (new_page > 0){
          go_to_page(new_page);}
  }

  function next(event){
      event.preventDefault();
      var new_page = parseInt($('.active_page').attr('data-pageNumber'), 10) + 1;
      if (new_page <= number_of_pages){
          go_to_page(new_page);}
  }

    function skipToPage(event){
        event.preventDefault();
        var page_num = $(this).attr('data-pageNumber');
        go_to_page(page_num);
    }

  function go_to_page(page_num){
      var start_from = (page_num - 1)* show_per_page;
      var end_on = start_from + show_per_page;
    
      //hide all children elements of content div, get specific items and show them
      $('#songList tbody tr').css('display', 'none').slice(start_from, end_on).css('display', '');

  // remove active class from all pages and assign it to page where data-pageNumber=page_num
      $('#page_navigation .page_link').removeClass('active_page');
      $('.page_link[data-pageNumber="'+page_num+'"]').addClass('active_page');
  }
  
// event handlers for prev, next, & page_links
    $('#page_navigation').on('click', 'a.previous_link', previous);
    $('#page_navigation').on('click', 'a.next_link', next);
    $('#page_navigation').on('click', 'a.page_link', skipToPage);
}

        function showTrack(event){
            event.preventDefault();

            // get id from link rel
            var thisTrackId = $(this).attr('rel');
            
            var arrayPosition = trackData.map(function(arrayItem){return arrayItem._id;}).indexOf(thisTrackId);
            var thisTrackObject = trackData[arrayPosition];
            
            $('#trackInfoName').text(thisTrackObject.songtitle);
            $('#trackInfoArtist').text(thisTrackObject.artist);
            
            //should really be using native js methods for dom manipulation like this one:
            $('#trackInfoUrl').html('<textarea class="urlttextarea">'+thisTrackObject.url+'</textarea>');
            
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
            if ( ! $('#playlist li').length ){
            var audio = $("#audio");      
            $("#audiosource").attr("src", thisTrackObject.url);

// handler for song with 404? the problem now is if the playlist is empty the error event fires but
//there is no next track to move on to --- could make it so if error fires on initial add,
// current track  class is not applied and moved to the next, or could alert user that the link
// for this track is dead
            audio[0].pause();
            audio[0].load();
            audio[0].play();

            $('#playlist ul').append("<li data-url='"+thisTrackObject.url+"' class='playlist-item currently-playing'>" + thisTrackObject.songtitle +", "+thisTrackObject.artist + "</li>");
            } else { 
                $('#playlist ul').append("<li data-url='"+thisTrackObject.url+"' class='playlist-item'>" + thisTrackObject.songtitle +", "+thisTrackObject.artist + "</li>");
            }
}

 //highlight track on hover in playlist
    $('#playlist').on({
            mouseenter: function () {
            $(this).addClass('highlightedplaylisttrack');
            },
            mouseleave: function () {
            $(this).removeClass('highlightedplaylisttrack');}
            }, ".playlist-item");
            
//select track on click in playlist
    $('#playlist').on('click', 'li.playlist-item', function(){
            $('#playlist li').removeClass('selected-playlisttrack');
            $(this).addClass('selected-playlisttrack');});

// detect track ended event and load next track
    $('#audio')[0].addEventListener('ended', function(){
            var currentTrack = $(".currently-playing");
            var nextTrack = currentTrack.next('.playlist-item');
        
            if ( currentTrack.is(':last-child')){
                return } 
            else {
                moveToNextSong(currentTrack, nextTrack);

// Handle error by silently moving to next track 
// acually this error handler should be its own function?
            var source =$('#audiosource')[0];
            source.addEventListener('error', function(e){
                if (e){
                    currentTrack = $(".currently-playing");
                    nextTrack = currentTrack.next('.playlist-item');
                    moveToNextSong(currentTrack, nextTrack);
                    }    
            });
        }
    });

// rewind track and if currentTime < 2 load previous track
    $('#rewindaudio').on('click', function(){
        var currentTrack = $('.currently-playing');
        var prevTrack = currentTrack.prev('.playlist-item');
            if ( ($('#audio')[0].currentTime < 2) && $('li').index(currentTrack) ){
                moveToNextSong(currentTrack, prevTrack);
            }else{
        $('#audio')[0].currentTime = 0; 
        }
    });
    
    $('#ffaudio').on('click', function(){
        var currentTrack = $('.currently-playing');
        var nextTrack = currentTrack.next('.playlist-item');
        moveToNextSong(currentTrack, nextTrack);
    });
    
    $('#removeselected').on('click', function(){
    //check and see if selected is also currently playing - if so skip audio to next track before removing
        var $selected = $('.selected-playlisttrack');
        if ($selected.hasClass('currently-playing')) {
            var currentTrack = $('.currently-playing');
            var nextTrack = currentTrack.next('.playlist-item');
            moveToNextSong(currentTrack, nextTrack);
        }
        $selected.remove();
    });

    $('#skiptoselected').on('click', function(){
        var $selected = $('.selected-playlisttrack');
        var $currentTrack = $('.currently-playing');
        moveToNextSong($currentTrack, $selected);
    });

// function takes two DOM elements
//i should rewrite this so nextsong is first argument and second argument is optional
//then i can use it again in the if clause of the addtracktoplaylist function
    function moveToNextSong(currentSong, nextSong){
        $('#audiosource').attr('src', nextSong.attr('data-url') );
        $('#audio')[0].load();
        $('#audio')[0].play();
        nextSong.addClass('currently-playing');
        currentSong.removeClass('currently-playing');
    }

}());
