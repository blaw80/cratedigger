(function init(){    
    var trackData = [];
    
    $(document).ready(function(){
        
        populateTable();
        $('#trackInfo p').on('click','a.deletebutton', deleteTrack);
        $('#editTrackForm').on('click', 'button#submitEdit', displayUpdated);
        $('#editTrackForm').on('click', 'button#submitNewTrack', writeNewTrack);
    });

function populateTable() {

    $.getJSON( '/play/tracklist', function( data ) {
    trackData = data;
    var table = document.getElementById('tracksTableBody');
    $(table).empty();
    $.each(data, function(){
        var trow = document.createElement('tr');

        var song = document.createElement('td');
        var songText = document.createTextNode(this.songtitle);
        song.appendChild(songText);
        trow.appendChild(song);

        var artist = document.createElement('td');
        var artistText = document.createTextNode(this.artist);
        artist.appendChild(artistText);
        trow.appendChild(artist);

        var info = document.createElement('td');
        var infoHtml = '<span class="infobutton fa fa-info-circle" rel="' + this._id + '"></span>';
        info.innerHTML = infoHtml;
        trow.appendChild(info);

        var addTrack = document.createElement('td');
        var addTrackHtml = '<span class="addtoplaylist fa fa-plus-circle" rel="' + this._id + '"></span>';
        addTrack.innerHTML = addTrackHtml;
        trow.appendChild(addTrack);

        table.appendChild(trow);
    });

    paginate();
    });
}

function paginate(){
      var show_per_page = 5;
      var number_of_items = $('#songList tbody tr').length;
      var number_of_pages = Math.ceil(number_of_items/show_per_page);

      var navigation_html = '<a class="previous_link button" href="#">Prev</a>';
      var current_link = 1;
      while(number_of_pages >= current_link){
          navigation_html += '<a class="page_link button" href="#" data-pageNumber="'+ current_link +'">'+ (current_link) +'</a>';
          current_link++;}
          
      navigation_html += '<a class="next_link button" href="#">Next</a>';
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

var manageTracks = {
    init: function(){
        this.cachedDom();
        this.bindEvents();
        },
  
    bindEvents: function(){
        $('#songList table tbody').on('click', 'td .infobutton', this.showTrack);
        $('#songList table tbody').on('click', 'td .addtoplaylist', this.addToPlaylist);
        $('#trackInfo p').on('click', 'a.editbutton', this.editTrack);
        this.$editTrackForm.on('click', 'button#cancelAdd', this.cancelAdd.bind(this));
        this.$editTrackForm.on('click', 'button#cancelEdit', this.cancelEdit.bind(this));        
        },
        
    cancelEdit: function(event){
            event.preventDefault();
            this.$editTrackForm.empty();
        },
    cancelAdd: function(event){
            event.preventDefault();
            this.$editTrackForm.empty();
        },  
    
    addToPlaylist: function(event){
            event.preventDefault();
            
            var thisTrackId = $(this).attr('rel');
            var arrayPosition = trackData.map(function(arrayItem){return arrayItem._id;}).indexOf(thisTrackId);
            var thisTrackObject = trackData[arrayPosition];

            $('#playlist ul').append("<li data-url='"+thisTrackObject.url+"' class='playlist-item'>" + thisTrackObject.songtitle +", "+thisTrackObject.artist + '<span id="removeFromPlaylist" class="fa fa-trash-o"></span></li>');
            
            if ( $('#playlist li').length === 1 ){
                var firstTrack = $('.playlist-item');
                audioPlayer.moveToNextSong(firstTrack);
            } 
        },
  
    editTrack: function(event){
        event.preventDefault();

        var thisTrackId = $(this).attr('rel');
        var arrayPosition = trackData.map(function(arrayItem){return arrayItem._id;}).indexOf(thisTrackId);
        var thisTrackObject = trackData[arrayPosition];

        var editFormString = '<form id="formEditSongFields" name="editSong">'+
            '<input id="editSongTitle" type="text" name="songname" value="' + thisTrackObject.songtitle +'">' + 
            '<input id="editArtist" type="text" name="artistname" value="' +thisTrackObject.artist +'">' +
            '<input id="editUrl" type="text" name="songurl" value="' + thisTrackObject.url +'">' +
            '<button id="submitEdit" type="button" data-id="'+thisTrackObject._id+'">save changes</button><button type="button" id="cancelEdit">cancel</button></form>';

            manageTracks.$editTrackForm.html(editFormString);            
        },
  
    showTrack: function(event){
            event.preventDefault();
            $('#playLists').empty();
            $('#songList').css('display', 'none');
            $('#trackInfo').css('display', '');
            // get id from link rel
            var thisTrackId = $(this).attr('rel');
            
            var arrayPosition = trackData.map(function(arrayItem){return arrayItem._id;}).indexOf(thisTrackId);
            var thisTrackObject = trackData[arrayPosition];
            
            $('#trackInfoName').text(thisTrackObject.songtitle);
            $('#trackInfoArtist').text(thisTrackObject.artist);
            $('#trackInfoUrl').html('<textarea class="urlttextarea">'+thisTrackObject.url+'</textarea>');
            $('#editTrack').html('<a href="#" class="editbutton" rel="'+ thisTrackObject._id + '">Edit Details</a>');
            $('#deleteTrackBtn').html('<a href="#" class="deletebutton" rel="'+thisTrackObject._id + '">Delete Track</a>');
            manageTracks.$editTrackForm.empty();
        },    
  
  cachedDom: function(){
    this.$editTrackForm = $('#editTrackForm');  
  }
};
manageTracks.init();

        function displayUpdated(event){
            event.preventDefault();
            var editedTrackInfo = { 'songtitle': $('#editTrackForm input#editSongTitle').val(),
                                'artist': $('#editTrackForm input#editArtist').val(),
                                'url': $('#editTrackForm input#editUrl').val() };
            //just use 'this' :)
            var songId = $('#editTrackForm button#submitEdit').attr('data-id');

            //post JSON data to collection & then run populateTable() to show updated info
            $.ajax({
                type: 'PUT',
                data: editedTrackInfo,
                url: '/play/updated/'+songId,
                dataType: 'JSON'
            }).done(function(response){
                
              if (response.msg === '')  {
                  $('#trackInfoName').text(editedTrackInfo.songtitle);
                  $('#trackInfoArtist').text(editedTrackInfo.artist);
                  $('#trackInfoUrl .urlttextarea').text(editedTrackInfo.url);
                  $('#editTrackForm').empty();
                  populateTable();
              }
              else if (response.msg === '0') { alert('you must be signed in for that') ; }
              //else {alert('error'+ response.msg);}
            });
        }
        
        function deleteTrack(event){
            event.preventDefault();
            var thisTrackId = $(this).attr('rel');
            var confirmation = confirm("are you sure you want to delete this track?"+thisTrackId);

            if (confirmation === true){
                $.ajax({
                    type: 'DELETE',
                    url: '/play/deletetrack/'+ thisTrackId
                }).done(function(response){
                    if (response.msg ===''){alert('delete successful')}
                    else if (response.msg === '0') {alert("you don't have delete permission")}
                    populateTable();
                });
            }
            else {return false}
            }

        function writeNewTrack(event){
            event.preventDefault();
            var newTrackInfo = {'songtitle': $('#addSongTitle').val(),
                                'artist': $('#addArtist').val(),
                                'url': $('#addUrl').val()};
            $.ajax({
                type: 'POST',
                url: '/play/addtrack',
                dataType: 'JSON',
                data: newTrackInfo
            }).done(function(response){
                if (response.msg ===''){
                    $('#trackInfoName').text(newTrackInfo.songtitle);
                    $('#trackInfoArtist').text(newTrackInfo.artist);
                    $('#trackInfoUrl .urlttextarea').text(newTrackInfo.url);

                    populateTable();
                    $('#editTrackForm').empty();
                    $('#infobox').css('display', 'block');
                }
                    else if (response.msg === 'dupe'){alert("that url is already in the database")}
                    else if (response.msg === '0'){alert('you must be signed in for that')}
            });
        }
  
        var audioPlayer = {
            
            init: function(){
                this.cachedDom();
                this.bindEvents();
            },
            
            bindEvents: function(){
                this.$ffaudio.on('click', this.ffaudio.bind(this));
                this.$rewindaudio.on('click', this.rewindaudio.bind(this));
                this.audio.addEventListener('ended', this.trackEnded.bind(this));
                this.$audioSource[0].addEventListener('error', this.handleAudioErr.bind(this));
                this.$playlist.on('dblclick', 'li.playlist-item', this.skipToTrack);
                this.$playlist.on('click', '#removeFromPlaylist', this.removeFromPlaylist);
                this.$playlist.on({ mouseenter: this.addHighlight, mouseleave: this.removeHighlight }, ".playlist-item");
                this.$savePlaylist.on('click', this.savePlaylist);
                },
            
            savePlaylist: function(){
                var playlistName = prompt('choose a name');
                var tracks = [];
                var newPlaylist = {};
                if (playlistName ==='') {alert('name cannot be left blank'); return}
                $('#playlist li').each(function(index){
                    tracks.push({'song': $(this).text(), 'url': $(this).attr('data-url')});
                });
                newPlaylist.name = playlistName;
                newPlaylist.creator = 'anon';
                newPlaylist.tracks = tracks;
                    
                $.ajax({
                        type: 'POST',
                        url: '/play/saveplaylist',
                        dataType: 'JSON',
                        contentType: 'application/json',
                        data: JSON.stringify(newPlaylist)
                    }).done(function(response){
                        if (response.msg ===''){
                           alert('save success');
                        // UPDATE SOMETHING ON PAGE
                        }
                            else if (response.msg === '0') {alert('sign in or create an account to do this')}
                            else {alert(response.msg);}
                    });
                },
            
            removeHighlight:  function () {
                    $(this).removeClass('highlightedplaylisttrack');},
                
            addHighlight: function() {
                    $(this).addClass('highlightedplaylisttrack');
                    },
            
            removeFromPlaylist: function(event){
                event.preventDefault();
                //check and see if selected is also currently playing - if so skip audio to next track before removing
                    var $selected = $(this).parent();
                    if ($selected.hasClass('currently-playing')) {
                        audioPlayer.ffaudio();
                    }
                    $selected.remove();
                },
            
            skipToTrack: function(event){
                event.preventDefault();
                var $currentTrack = $('.currently-playing');
                var $selected = $(this);
                audioPlayer.moveToNextSong($selected, $currentTrack);
            },
            
            handleAudioErr: function(e){
                    if (e) {
                        //should check and see if node is last child
                        this.ffaudio();}    
                },
        
            trackEnded: function(){
                var currentTrack = $(".currently-playing");
                var nextTrack = currentTrack.next('.playlist-item');
                if ( currentTrack.is(':last-child')){
                    return } 
                else {
                    this.moveToNextSong(nextTrack, currentTrack);
                    }
            },

            rewindaudio: function(){
                var currentTrack = $('.currently-playing');
                var prevTrack = currentTrack.prev('.playlist-item');
                if ( (this.audio.currentTime < 2) && $('li').index(currentTrack) ){
                this.moveToNextSong(prevTrack, currentTrack);}
                else{
                this.audio.currentTime = 0; 
                }
            },

            ffaudio: function(){
                var currentTrack = $('.currently-playing');
                var nextTrack = currentTrack.next('.playlist-item');
                this.moveToNextSong(nextTrack, currentTrack);
            },
            
            cachedDom: function(){
                this.$rewindaudio = $('#rewindaudio');
                this.$ffaudio = $('#ffaudio');
                this.$savePlaylist = $('#savePlaylist');
                this.$playlist = $('#playlist');
                this.audio = $('#audio')[0];
                this.$audioSource = $('#audiosource');
            },
            
            moveToNextSong: function(nextSong, currentSong){
                this.$audioSource.attr('src', nextSong.attr('data-url') );
                this.audio.load();
                this.audio.play();
                nextSong.addClass('currently-playing');
                    if (arguments.length > 1){
                        currentSong.removeClass('currently-playing');
                    }
            }
        };
        audioPlayer.init();

        var mainContent = {
            init: function(){
                this.cachedDom();
                this.bindEvents();
            },
            
            cachedDom: function(){
                 this.$songList = $('#songList');
                 this.$trackInfo = $('#trackInfo');
                 this.$playLists = $('#playLists');
            },
            
            bindEvents: function(){
                $('#content').on('click', 'button', this.handleNav);
            },
            
            handleNav: function(){
                var link = $(this).attr('id');
                if (link === 'showPlayer'){mainContent.showPlayer(event);}
                if (link === 'loadSongs'){mainContent.loadSongs(event).bind(this);}
                if (link === 'addTrack'){mainContent.addTrack(event);}
                if (link === 'loadPlaylist'){mainContent.showPlaylists(event);}
            },
            
            showPlayer: function (event){
                event.preventDefault();
                this.resetNav();
                $('#player').css('display', 'block');
            },
            
            resetNav: function (){
                this.$playLists.css('display', 'none');
                this.$songList.css('display', 'none');
                this.$trackInfo.css('display', 'none');
                //should re-write this to be more modular, take an argument for which item to display
            },
    
            showPlaylists: function(event){
                event.preventDefault();
                this.$playLists.empty();
                //ajax get all playlists
                $.getJSON( '/play/playlists', function( data ) {
                    mainContent.$playLists.append('<h4>There are '+ data.length + ' playlists to choose from</h4>');
                    $.each(data, function(){
                        var thisStars;
                        this.stars===undefined ? thisStars = 0 : thisStars = this.stars;
                      mainContent.$playLists.append('<a href="#" rel="'+this._id+'">' + this.name + ' - created by: ' + this.creator + '</a>Starred '+thisStars+' times <span class="upvotePlaylist fa fa-star-o" data-name="'+this.name+'"></span><br>'); 
                   });
                });
                this.$songList.css('display', 'none');
                this.$trackInfo.css('display', 'none');
                this.$playLists.css('display', 'block');
            },
              
            loadSongs: function(event){
                event.preventDefault();
                this.$songList.css('display', '');
                //this.$playLists.css('display', 'none');
                this.$trackInfo.css('display', 'none');
                this.$playLists.empty();
            },
            
            addTrack: function(event){
                event.preventDefault();
                this.$playLists.empty();
                this.$songList.css('display', 'none');
                this.$trackInfo.css('display', 'block');
                $('#infobox').css('display', 'none');
                $('#editTrackForm').empty();
                var addTrackString = '<p>Add track details here</p><form id="addTrackForm" name="addsong">'+
                    '<input id="addSongTitle" type="text" name="songname" placeholder="song title">' + 
                    '<input id="addArtist" type="text" name="artistname" placeholder="artist">' +
                    '<input id="addUrl" type="text" name="songurl" placeholder="url">' +
                    '<button id="submitNewTrack" type="button">save changes</button><button type="button" id="cancelAdd">cancel</button></form>';
                $('#editTrackForm').html(addTrackString);
            }
        };
        mainContent.init();

    $('#playLists').on('click', 'a', loadPlaylist);
    
    function loadPlaylist(){
        var playlistId = $(this).attr('rel');

        $.getJSON('/play/loadplaylist/'+playlistId, function(data){
            var tracks = data.tracks;
            $('#playlist ul').empty();
            $.each(tracks, function(){ 
               $('#playlist ul').append("<li data-url='"+this.url+"' class='playlist-item'>" + this.song +"</li>");
           });
           audioPlayer.moveToNextSong($('#playlist li:first'));
        });
        //reset display on songs 
        $('#songList').css('display', '');
        $('#playLists').css('display', 'none');
        $('#playLists').empty();
    }

    $('#playLists').on('click', '.upvotePlaylist', starPlaylist);
    
    function starPlaylist(){
        var thisplaylist = $(this).attr('data-name');
       //  alert(thisplaylist);
         $.ajax({
                type: 'POST',
                url: '/play/starplaylist/'+thisplaylist,
                dataType: 'String',
                data: thisplaylist
            }).done(function(response){
                if (response.msg ===''){
                    alert('posted');
                }
                else if (response.msg === '0'){alert('you must be signed in for that')}
                    else {alert(response.msg)}
                    //else {alert('error: '+ response.msg);}
            });
    }

}());
