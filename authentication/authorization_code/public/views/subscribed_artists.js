// console.log("Subscribed artists page loaded");
var token = sessionStorage.getItem('access_token');
sessionStorage.setItem('access_token', token);
// console.log("set token = ",token);
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
});
$(document).ready(function() {
    const sub1 = ($('#subscribedArtists').data('subs'))
    // console.log("subs",sub1);
  });
  