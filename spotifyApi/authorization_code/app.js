/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
const path = require('path');
var cors = require('cors');
const fs = require('fs');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require("email-validator");

var selectuserid;

var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "oliver29",
    database: "Notified"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var client_id = 'b9bd5d60afce4b29bc880a786130628e'; // Your client id
var client_secret = '7474fdee3b1c441c9b71f0210a51a898'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/views'));
// app.engine('ejs', ejs.renderFile);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/', function(req, res) {

});
app.post('/', function(req, res) {
  //check to see if email is already in database
  if(validator.validate(req.body.email) ){
    const selectQuery1 = "SELECT email FROM users WHERE email = ?";
    con.query(selectQuery1, [req.body.email], function (err, result) {
      // console.log(result)
      if (result.length > 0) {
        res.redirect('/');
        console.log("email already in database")
      }
      else{
        const insertQuery = "INSERT INTO Users (email, username, password) VALUES (?, ?, ?)";
        const selectQuery = "SELECT user_id FROM users WHERE username = ?";
      
        con.query(insertQuery, [req.body.email, req.body.username, req.body.password], function (err, result) {
          if (err) throw err;
          con.query(selectQuery, [req.body.username], function (err, result) {
            if (err) throw err;
            const userId = result[0].user_id;
            selectuserid = userId
            // console.log(selectuserid)
            res.redirect('/login_start');
          });
        });
      }
    });
  }
  else{
    res.redirect('/');
    console.log("invalid email")
  }
});

app.get('/login_start', function(req, res) {
  // res.render('login', {userId: selectuserid});
  res.sendFile(__dirname + '/public/login.html');
});


app.get('/login', function(req, res) {
  // console.log("hitting redirect uri")
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/login_start#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/userprofilepage#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/login_start#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/userprofilepage', function(req, res) {
  res.sendFile(__dirname + '/public/userprofilepage.html');
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
app.get('/artistsearch', function(req, res) {
  res.sendFile(__dirname + '/public/artistsearch.html');
});

app.get('/artistAlbums', function(req, res) {
  res.sendFile(__dirname + '/public/artistAlbums.html');
});

app.post('/subscribe', (req, res) => {
  var artist_id = req.body.artist_id;
  var artist_name = req.body.artist_name;
  var artist_img = req.body.artist_img;
  // console.log(artist_id)
  //if artist is already in database, do not add to database
  //if artist is not in database, add to database
  var selectQuery = "SELECT user_id, artist_name, artist_id FROM Subscribed_Artists WHERE (user_id,artist_name, artist_id, artist_img) = ("+selectuserid+","+artist_name+","+ artist_id +","+ artist_img + ")";
  var sql = "INSERT INTO Subscribed_Artists (user_id, artist_name, artist_id, artist_img) VALUES ("+selectuserid+","+artist_name+","+ artist_id + ","+ artist_img+ ")";
  con.query(selectQuery, function (err, result) {
    //if the query returns a result, the artist is already in the database
    // console.log("SELECTED",result)
    if (result.length > 0) {
      console.log("artist already in database");
    }
    else{
      con.query(sql, function (err, result) {
        if (err) throw err;
        // console.log(result)
        console.log("artists inserted");
      });
    }
  });
  res.sendStatus(200);
  console.log("new artist inserted");
});

app.get('/myArtists', function(req, res) {
  // const selectQuery = "SELECT * FROM Subscribed_Artists WHERE user_id = ?";
  const selectQuery = "SELECT * FROM Subscribed_Artists WHERE user_id = ("+selectuserid+")";
  
  var subs
  con.query(selectQuery, [selectuserid], function (err, result) {
    if (err) {
      console.log("error" + err)
      return;
    }
    const subs = result;
    fs.readFile(__dirname + '/public/views/subscribed_artists.ejs', 'utf8', function(err, template) {
      if (err) {
        console.log("error" + err);
        return;
      }
      // console.log(JSON.stringify(subs))
      const html = ejs.render(template, {subs:subs, jsonsubs: JSON.stringify(subs)});
      res.send(html);
    });
  })
});
app.get('/signin', function(req, res) {
  // console.log("signin");
  res.sendFile(__dirname + '/public/signup.html')
});

app.post('/signin', function(req, res) {

  var email = req.body.email;
  if(validator.validate(email)){
    var password = req.body.password;
    var selectQuery = "SELECT * FROM Users WHERE (email, password) = (?,?)";
    con.query(selectQuery, [email, password], function (err, result) {
      console.log("result = ",result)
      if (err) {
        console.log("error" + err)
        return;
      }
      if (result.length > 0) {
        console.log("user already in database");
        selectuserid = result[0].user_id;
        res.redirect('/login');
      }
      else{
        console.log("user not in database");
        res.redirect('/');
      }
    });
  }
  else{
    console.log("invalid email");
    res.redirect('/');
  }
});


console.log('Listening on 8888');
app.listen(8888);
