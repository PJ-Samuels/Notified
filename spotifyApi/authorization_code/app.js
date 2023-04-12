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
const nodemailer = require('nodemailer');
var config = require("./config.js")

var selectuserid;

var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: config.MY_SQL_PASSWORD,
    database: "Notified"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var client_id = config.SPOTIFY_CLIENT_ID; // Your client id
var client_secret = config.SPOTIFY_SECRET_ID; // Your secret
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
  const password = sq.hash(email,  result['password'])
  if(validator.validate(req.body.email) ){
    const selectQuery1 = "SELECT email FROM users WHERE email = ?";
    con.query(selectQuery1, [req.body.email], function (err, result) {
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
  res.sendFile(__dirname + '/public/login.html');
});


app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

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
app.get('/usersettings', function(req, res) {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/userprofilepage', function(req, res) {
  var access_token = req.query.access_token
  const selectQuery = `SELECT * FROM Subscribed_Artists WHERE user_id = (${selectuserid})`;
  con.query(selectQuery, function (err, result) {
    const artists = result
    const notifs = []
    fs.readFile(__dirname + '/public/userprofilepage.ejs', 'utf8', function(err, template) {
      const html = ejs.render(template, {artists: artists, notifications: notifs, access_token: access_token});
      res.send(html);
    });

  });
  // res.sendFile(__dirname + '/public/userprofilepage.html');
});

app.get('/refresh_token', function(req, res) {

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
  var selectQuery =  `SELECT user_id, artist_name, artist_id FROM Subscribed_Artists WHERE (user_id,artist_name, artist_id, artist_img) = (${selectuserid}, ${artist_name}, ${artist_id}, ${artist_img})`;
  var sql = `INSERT INTO Subscribed_Artists (user_id, artist_name, artist_id, artist_img) VALUES (${selectuserid}, ${artist_name}, ${artist_id}, ${artist_img})`;
  con.query(selectQuery, function (err, result) {
    if (result.length > 0) {
      console.log("artist already in database");
    }
    else{
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("artists inserted");
      });
    }
  });
  res.sendStatus(200);
  // console.log("new artist inserted");
});

app.post('/unsubscribe', (req, res) => {
  var artist_id = req.body.artist_id;
  var artist_name = req.body.artist_name;
  var artist_img = req.body.artist_img;
  var selectQuery = `SELECT user_id, artist_name, artist_id FROM Subscribed_Artists WHERE (user_id,artist_name, artist_id, artist_img) = (${selectuserid}, ${artist_name}, ${artist_id}, ${artist_img})`;
  var sql = `DELETE FROM Subscribed_Artists WHERE (user_id, artist_name, artist_id, artist_img) = (${selectuserid}, ${artist_name}, ${artist_id}, ${artist_img})`;

  con.query(selectQuery, function (err, result) {
    console.log("first result = ", result);
    if (err) throw err;
    if (result.length === 0) {
      console.log("artist already unsubscribed");
    } else {
      con.query(sql, [selectuserid, artist_name], function (err, result2) {
        if (err) throw err;
        console.log("artist deleted");
      });
    }
  });

  res.sendStatus(200);
  console.log("artist unsubscribed");
});

app.get("/sendEmail", function(req, res) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pjsamuels3@gmail.com',
      pass: config.MY_GMAIL_PASSWORD
    }
  });

  var mailOptions = {
    from: 'pjsamuels3@gmail.com',
    to: 'osamuels@bu.edu',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  
});


app.get('/myArtists', function(req, res) {
  const selectQuery = "SELECT * FROM Subscribed_Artists WHERE user_id = ("+selectuserid+")";
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

      const html = ejs.render(template, {subs:subs, jsonsubs: JSON.stringify(subs)});
      res.send(html);
    });
  })
});
app.get('/signin', function(req, res) {
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
