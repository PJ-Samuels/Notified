// console.log("Subscribed artists page loaded");
var token = sessionStorage.getItem('access_token');
sessionStorage.setItem('access_token', token);
$(document).ready(function () {
    $("#go_back").click(function () {
        $.ajax({
            type: "GET",
            url: "/artistsearch",                    
            success: function() {
                sessionStorage.setItem('access_token', token);
                window.location.href = "/artistsearch";
            }
          });
    });

    $("#email-notif").click(function () {
        const subscribedArtists = ($('#subscribedArtists').data('subs'))
        const artistAlbums = [];
        subscribedArtists.forEach(function (artist) {
            artist_albums(artist.artist_id, function(albumData) {
                console.log("album name",albumData[0].name)
                artistAlbums.push(...[[artist.artist_name, albumData[0].name]]);


                if (artistAlbums.length === subscribedArtists.length) {
                    $.ajax({
                        type: "POST",
                        url: "/sendEmail",
                        data: JSON.stringify(artistAlbums),
                        contentType: 'application/json',
                        success: function() {
                            console.log("Email sent successfully.");
                        },
                        error: function(error) {
                            console.log("Error sending email:", error.responseText);
                        }
                    });
                }
            });
        });
    });

});
$(document).ready(function() {
    const sub1 = ($('#subscribedArtists').data('subs'))
    console.log("subs",sub1);
});

function artist_albums (artistId, callback) {
    // console.log("hitting")
    $.ajax({
        url: 'https://api.spotify.com/v1/artists/' + artistId + '/albums',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (response) {
            console.log(response.items)
            callback(response.items);
        }
    });
}
