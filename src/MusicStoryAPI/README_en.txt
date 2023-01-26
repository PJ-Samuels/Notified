
Music Story SDK Javascript base Documentation
----------------------------------------------------------


The attached SDK written by Music Story allows a simplified use of the API Music Story (developers.music-story.com).
It provides basis functionalities such as the Oauth authentification, the search and retrieval of Objects, connectors, the exploration of results.
It can also serve as a basis for the development of libraries with more advanced functionalities.
Two versions are provided:
- MusicStoryAPI.class.js , development version
- MusicStoryAPI.class.min.js , compressed version


1) Authentication

The authentication is done during your first request.
You have to provide your ConsumerKey and ConsumerSecret in order to connect to the Api.
If you don't specify your access tokens: "AccessToken" and "TokenSecret", the authentication will take care of getting new ones by the "getToken()" function.

example:

<html>
	<head>
		<script src="MusicStoryAPI.class.min.js"></script>
	</head>
	<body>
		<script>
			var key = '{ConsumerKey}';
			var secret = '{ConsumerSecret}';
			var api = new MusicStoryApi(key, secret);
			// looking for some bands. This first call will take care of getting tokens before doing request.
			api.search('Artist', {type: 'Band'}, function(list) {
				...
			});
		</script>
	</body>
</html>


2) Retrieval of an object by an ID

The function that allows this operation is the function "get({Name of the object},{id of the object},{facultatives fields},{callback})".
Refer to the online documentation (developers.music-story.com/developers) to know the list of available Music Story objects.

example:

// get the artist by the ID 2
api.get('Artist', 2, null, function(artist) {
	...
});

The returned object will be an instance with the "MusicStoryObject" class.

next part of example:

// get the artist by the ID 2
api.get('Artist', 2, null, function(artist) {
	// we want the artist name
	var name=artist.name;
});


3) Search for the objects

The search for objects is done via the method: "search{Name of the object}({associative table of filters},{callback},{desired page},{number of results per page})".
If not requested, the number of results per page is 10 and is fixed as a maximum of 100.

example:

// some bands
api.search('Artist', {type: 'Band'}, function(list) {
	// for each one
	while (list.hasNext()) {
		var artiste=list.next();
		...
	}
});

This function sends back a "MusicStoryObjects" object with an iterator behaviour, that lists the objects of the "MusicStoryObject" type.
Some explicit methods are put at your disposition such as the iterator functions "current()", "next()", "prev()","hasNext()","hasPrev()", as well as the functions "hasNextPage()" et "hasPrevPage()", that can be useful for a complete exploration of the results.


4) Connectors

It is possible to carry out a connector request on a "MusicStoryObject" by using the method "get{Name of the connector}({filters associative array},{desired page},{number of results per page},{callback})".
Refer to the online documentation (developers.music-story.com/developers) to know the list of connectors of the object.
The result is of the same type as for a search request.


next part of example:

...
var artist=list.next();
// get the artist discography
artist.getConnector('albums', {link: 'Main'}, null, 100, function(albums, _this) {
	// callback parameter "_this" is the previous "artist" object
	...
});


5) Complete example

// we want to display 50 french bands wich associated pictures and discographies
<html>
	<head>
		<script src="MusicStoryAPI.class.min.js"></script>
		<style>
			#bands{
				list-style:none;
				position:relative;
			}
			#bands > li{
				display:inline-block;
				width:18%;
				background:#CBCFD4;
				padding:10px 15px;
				margin-right:1%;
				margin-bottom: 15px;
				vertical-align:top;
				height:150px;
				overflow: auto;
			}
			#bands > li > h2{
				margin-top:0;
			}
			#bands > li > img{
				margin-bottom: 15px;
			}
		</style>
	</head>
	<body>
		<ul id="bands">
		</ul>
		<script>
			var ul = document.getElementById('bands');
			var key = 'CONSUMER KEY';
			var secret = 'CONSUMER SECRET';
			var api = new MusicStoryApi(key, secret);
			api.search('Artist', {type: 'Band', country: 'France'}, function(list) {
				while (list.hasNext()) {
					list.next().getConnector('pictures', null, null, null, function(pics, _this) {
						_this.getConnector('albums', {link: 'Main'}, null, 100, function(albums) {
							var li = document.createElement('li');
							li.innerHTML = '<h2>' + _this.name + '</h2>' + ((pics.size() > 0) ? '<img height="50" src="' + pics.current().url + '"/>' : '') + '<ul>';
							while (albums.hasNext()) {
								var album = albums.next();
								li.innerHTML += '<li><a target="_blank" href="' + album.url + '">' + album.title + '</a></li>';
							}
							li.innerHTML += '<ul>';
							ul.appendChild(li);
						});
					});
				}
			},null,50);
		</script>
	</body>
</html>
