var params = new URLSearchParams(window.location.search);
console.log(params)
var access_token = params.get('access_token');
if(access_token == null){
    access_token = sessionStorage.getItem('access_token');
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
            html += '<p>' + artist.name + '</p>';
            html += '<button id = "artistAlbumPage"> view artist page </button>'
            html += '<button id = "subsribeArtist"> subscribe to artist </button>'
            html += '</div>';

            resultsPlaceholder.innerHTML = html;
            callback(artists[0]);

            $("#artistAlbumPage").click(function() {
                artist_albums(artists[0].id,function(response){
                    $.ajax({
                        type: "GET",
                        url: "/artistAlbums",                    
                        success: function() {
                            sessionStorage.setItem('artist_albums', JSON.stringify(response));
                            sessionStorage.setItem('artist_name', JSON.stringify(artists[0].name));
                            sessionStorage.setItem('artist_id', JSON.stringify(artists[0].id));
                            sessionStorage.setItem('artist_img', JSON.stringify(artists[0].images[0].url));
                            window.location.href = "/artistAlbums";
                        }
                      });
                });
            });
        }
    });
};

document.getElementById('search-form').addEventListener('submit', function (e) {
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
    $("#user_profile").click(function () {
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
