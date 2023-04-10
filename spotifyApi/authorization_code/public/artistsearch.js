var params = new URLSearchParams(window.location.search);
console.log(params)
var access_token = params.get('access_token');
if(access_token == null){
    // console.log('hittin')
    access_token = sessionStorage.getItem('access_token');
    // console.log("access token=",sessionStorage.getItem('access_token'));
}
sessionStorage.setItem('access_token', access_token);
// console.log("Artist search accesstoken: ",access_token);


var templateSource = document.getElementById('results-template').innerHTML,
    template = Handlebars.compile(templateSource),
    resultsPlaceholder = document.getElementById('results'),
    playingCssClass = 'playing',
    audioObject = null;

var fetchTracks = function (albumId, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        headers: { 'Authorization': 'Bearer ' + access_token },
        success: function (response) {
            callback(response);
        }
    });
};

function artist_albums (artistId, callback) {
    // console.log("hitting")
    $.ajax({
        url: 'https://api.spotify.com/v1/artists/' + artistId + '/albums',
        headers: { 'Authorization': 'Bearer ' + access_token },
        success: function (response) {
            console.log(response.items)
            callback(response.items);

        }
    });
}


var searchArtists = function (query, callback) {
    console.log("searchArtists: ",query)
    console.log("searchArtists token: ",access_token)
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        headers: { 'Authorization': 'Bearer ' + access_token },
        data: {
            q: query,
            type: 'artist'
        },
        success: function (response) {
            resultsPlaceholder.innerHTML = template(response);
            var artists = response.artists.items;
            var html = '';
            var artist = artists[0];
            html += '<div class="album">';
            html += '<a href="#" class="cover" data-album-id="' + artist.id + '">';
            html += '<img src="' + artist.images[0].url + '" alt="' + artist.name + '">';
            html += '</a>';
            html += '<h2>' + artist.name + '</h2>';
            html += '<button id = "artistAlbumPage"> go to artist page </button>'
            html += '</div>';

            resultsPlaceholder.innerHTML = html;
            // console.log("first artist",artists[0])
            callback(artists[0]);
            // console.log(artists)

            $("#artistAlbumPage").click(function() {
                artist_albums(artists[0].id,function(response){
                    // console.log("response: ",response)
                    // console.log(artists[0].images[0].url)
                    // console.log("artists_albums response test",artists_albums)
                    $.ajax({
                        type: "GET",
                        url: "/artistAlbums",                    
                        success: function() {
                            sessionStorage.setItem('artist_albums', JSON.stringify(response));
                            sessionStorage.setItem('artist_name', JSON.stringify(artists[0].name));
                            sessionStorage.setItem('artist_id', JSON.stringify(artists[0].id));
                            sessionStorage.setItem('artist_img', JSON.stringify(artists[0].images[0].url));
                            window.location.href = "/artistAlbums";
                        //   console.log("artist_albums",response)
                        }
                      });
                });
            });
        }
    });
};

// results.addEventListener('click', function (e) {
//     console.log("it was clicked")
//     var target = e.target;
//     if (target !== null && target.classList.contains('cover')) {
//         if (target.classList.contains(playingCssClass)) {
//             audioObject.pause();
//         } else {
//             if (audioObject) {
//                 audioObject.pause();
//             }
//             fetchTracks(target.getAttribute('data-album-id'), function (data) {
//                 audioObject = new Audio(data.tracks.items[0].preview_url);
//                 audioObject.play();
//                 target.classList.add(playingCssClass);
//                 audioObject.addEventListener('ended', function () {
//                     target.classList.remove(playingCssClass);
//                 });
//                 audioObject.addEventListener('pause', function () {
//                     target.classList.remove(playingCssClass);
//                 });
//             });
//         }
//     }
// });

document.getElementById('search-form').addEventListener('submit', function (e) {
    // console.log("it was submitted")
    e.preventDefault();
    const query = document.getElementById('query').value;
    searchArtists(query, function (artist) {
        console.log("Artist data: ", artist);
    });
}, false);

$(document).ready(function () {
    $("#my_artists").click(function () {
        window.location.href = "/myArtists";
    });
});

$(document).ready(function () {
    console.log("ready!")
    $("#user_profile").click(function () {
        console.log("user profile clicked"  )
        // window.location.href = "/userprofilepage";
        $.ajax({
            type: "GET",
            url: "/userprofilepage",
            data: { access_token: access_token },
            success: function() {
              window.location.href = "/userprofilepage?access_token=" + access_token;
            }
          });
    });
});