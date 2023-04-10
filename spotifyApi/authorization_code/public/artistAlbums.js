
var access_token = sessionStorage.getItem('access_token');
// console.log("Artist search accesstoken: ",access_token);
var artist_albums = sessionStorage.getItem('artist_albums');
var artist_name = sessionStorage.getItem('artist_name');
var artist_id = sessionStorage.getItem('artist_id');
var artist_img = sessionStorage.getItem('artist_img');
artist_albums = JSON.parse(artist_albums);
// console.log("artist_albums", artist_albums);
// if (artist_albums) {

// } 
// else {
//     console.log("No artist albums found in sessionStorage");
// }
// artist_albums = sessionStorage.getItem('artist_albums');
const uniqueAlbums = Array.from(new Set(artist_albums.map(a => a.name))).map(
    name => artist_albums.find(artist_album => artist_album.name === name)
);



console.log("Unique albums",uniqueAlbums);
if (uniqueAlbums) {
    // artist_albums = JSON.parse(artist_albums);
    // console.log("artist_albums", artist_albums);

    $(document).ready(function() {
        var html = '';
        for (var i = 0; i < 3; i++) {
            var album = uniqueAlbums[i];
            html += '<div class="album">';
            html += '<a href="#" class="cover" data-album-id="' + album.id + '">';
            html += '<img src="' + album.images[0].url + '" alt="' + album.name + '">';
            html += '</a>';
            html += '<h2>' + album.name + '</h2>';
            // html += '<button id="artistAlbumPage">go to artist page</button>';
            html += '</div>';
        }
        $('#albums-container').html(html);
    });
} 
else {
    console.log("No artist albums found in sessionStorage");
}

$("#subscribe").click(function() {
    console.log("subscribe button clicked");
    console.log("artist_id", artist_id);
    console.log("artist_name", artist_name);
    console.log("artist_img", artist_img)
    $.ajax({
        type: "POST",
        url: "/subscribe",
        data: {
            artist_id: artist_id,
            artist_name: artist_name,
            artist_img: artist_img
        },
        success: function() {
            console.log("successful subscribe");
        }
    });

});

$(document).ready(function () {
    $("#back").click(function () {
        $.ajax({
            type: "GET",
            url: "/artistsearch",                    
            success: function() {
                sessionStorage.setItem('access_token', (access_token));
                window.location.href = "/artistsearch";
            }
          });
    });
});