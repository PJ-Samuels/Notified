
var access_token = sessionStorage.getItem('access_token');
var artist_albums = sessionStorage.getItem('artist_albums');
var artist_name = sessionStorage.getItem('artist_name');
var artist_id = sessionStorage.getItem('artist_id');
var artist_img = sessionStorage.getItem('artist_img');
var artist_latest_album = sessionStorage.getItem('artist_latest_album');
artist_albums = JSON.parse(artist_albums);

const uniqueAlbums = Array.from(new Set(artist_albums.map(a => a.name))).map(
    name => artist_albums.find(artist_album => artist_album.name === name)
);



console.log("Unique albums",uniqueAlbums);
if (uniqueAlbums) {
    $(document).ready(function() {
        var html = '';
        for (var i = 0; i < 3; i++) {
            var album = uniqueAlbums[i];
            html += '<div class="album">';
            html += '<a href="#" class="cover" data-album-id="' + album.id + '">';
            html += '<img src="' + album.images[0].url + '" alt="' + album.name + '">';
            html += '</a>';
            html += '<h3>' + album.name + '</h3>';
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
    console.log("artist_latest_album", uniqueAlbums[0].name)
    $.ajax({
        type: "POST",
        url: "/subscribe",
        data: {
            artist_id: artist_id,
            artist_name: artist_name,
            artist_img: artist_img,
            artist_latest_album: uniqueAlbums[0].name
        },
        success: function() {
            alert("You have subscribed to " + artist_name + "!")
            console.log("successful subscribe");
        }
    });
});
$("#unsubscribe").click(function() {
    console.log("unsubscribe button clicked");
    console.log("artist_id", artist_id);
    console.log("artist_name", artist_name);
    console.log("artist_img", artist_img)
    console.log("artist_latest_album", artist_latest_album)
    $.ajax({
        type: "POST",
        url: "/unsubscribe",
        data: {
            artist_id: artist_id,
            artist_name: artist_name,
            artist_img: artist_img,
            artist_latest_album: artist_latest_album
        },
        success: function() {
            console.log("successful unsubscribe");
            alert("You unsubscribed from " + artist_name + "!")
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