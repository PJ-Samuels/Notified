var access_token;
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}
var params_temp = getHashParams();

$(document).ready(function() {
    setTimeout(()=>{
    $("#search-page").click(function() {
      var access_token = params_temp.access_token;
  
      $.ajax({
        type: "GET",
        url: "/artistsearch",
        data: { access_token: access_token },
        success: function() {
          window.location.href = "/artistsearch?access_token=" + access_token;
        }
      });
    });
    }, "1000")
  });

$("#user-settings").click(function() {
    var access_token = params_temp.access_token;

    $.ajax({
      type: "GET",
      url: "/artistsearch",
      data: { access_token: access_token },
      success: function() {
        window.location.href = "/artistsearch?access_token=" + access_token;
      }
    });
});
  