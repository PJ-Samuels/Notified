
Music Story SDK Api base Documentation
----------------------------------------------------------


Le SDK ci-joint écrit par Music Story, permet une utilisation simplifiée de l'API Music Story (developers.music-story.com).
Il fournit des fonctionalités de base telles que l'authentification Oauth, la recherche et la récupération d'Objet, de connecteurs, l'exploration des résultats.
IL pourra également servir de socle au développement de librairies aux fonctionalités plus avancées.
Deux versions sont mises à disposition:
- MusicStoryAPI.class.js , version de développement commentée
- MusicStoryAPI.class.min.js , version compressée


1) Authentification

L'authentification se fait lors de votre première requête.
Il est nécessaire pour vous identifier de fournir vos clés "ConsumerKey" et  "ConsumerSecret" lors de l'instanciation de la classe.
Si vous ne précisez pas vos tokens d'accès "AccessToken" et "TokenSecret", l'authentification se chargera d'en obtenir de nouveaux par la fonction "getToken()".

exemple:

<html>
	<head>
		<script src="MusicStoryAPI.class.min.js"></script>
	</head>
	<body>
		<script>
			var key = '{ConsumerKey}';
			var secret = '{ConsumerSecret}';
			var api = new MusicStoryApi(key, secret);
			// on recherche quelques groupes. Lors de ce premier appel le SDK se chargera de récupérer les tokens avant d'effectuer la requête demandée
			api.search('Artist', {type: 'Band'}, function(list) {
				...
			});
		</script>
	</body>
</html>


2) Récupération d'un Objet par ID

La fonction qui permet cette opération est la fonction "get({Nom de l'objet},{id de l'objet},{champs supplémentaires éventuels},{fonction callback})".
Référez vous à la documentation en ligne (developers.music-story.com/developers) pour connaître la liste des objets Music Story disponibles.

exemple:

// récupération de l'Artiste d'ID 2
api.get('Artist', 2, null, function(artist) {
	...
});

L'objet renvoyé sera une instance de la classe "MusicStoryObject", classe héritant de "MusicStoryApi".

suite de l'exemple:

// récupération de l'Artiste d'ID 2
api.get('Artist', 2, null, function(artist) {
	// récupération du nom de l'artiste
	var name=artist.name;
});


3) Recherche d'objets

La recherche d'objets s'effectue via la fonction "search({Nom de l'objet},{tableau filtres},{fonction callback},{page désirée},{nombre de résultats par page})".
Par défaut le nombre de résultats par page est de 10 et est fixé à un maximum de 100.

exemple:

// on recherche quelques artistes de type "Band"
api.search('Artist', {type: 'Band'}, function(list) {
	// pour chaque artiste
	while (list.hasNext()) {
		var artiste=list.next();
		...
	}
});

Cette fonction retourne un Objet "MusicStoryObjects" au comportement d'itérateur, qui liste des objets de type "MusicStoryObject".
Certaines méthodes explicites sont mises à disposition comme les fonctions d'itérateur "current()", "next()", "prev()","hasNext()","hasPrev()", ainsi que les fonctions "hasNextPage()" et "hasPrevPage()", qui peuvent être utiles pour une exploration complète des résultats.


4) Connecteurs

Il est possible d'effectuer une requête de type connecteur sur un "MusicStoryObject" en utilisant la fonction "getConnector({Nom du connecteur},{tableau associatif de filtres},{page désirée},{nombre de résultats par page},{fonction callback})".
Référez vous à la documentation en ligne (developers.music-story.com/developers) pour connaître la liste des connecteurs de l'objet disponibles.
Le résultat est du même type que pour une recherche.

suite exemple précédent:

...
var artiste=list.next();
// retrouver la discographie de l'artiste
artiste.getConnector('albums', {link: 'Main'}, null, 100, function(albums, _this) {
	...
});


5) Exemple complet - cas d'utilisation

// Le but ici est d'afficher 50 groupes français, leur photo, et leur discographie.
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
