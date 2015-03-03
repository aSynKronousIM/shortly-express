var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(cookieParser());
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/', 
function(req, res) {
  util.checkSession(req, function (result) {
    if (result) {
      res.render('index');
    } else {
      res.redirect(301, '/login');
    }
  });
});

app.get('/create', 
function(req, res) {
  util.checkSession(req, function (result) {
    if (result) {
      res.render('index');
    } else {
      res.redirect(301, '/login');
    }
  });
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  util.checkSession(req, function (result) {
    if (result) {//logged in user can post
      if (!util.isValidUrl(uri)) {
        console.log('Not a valid url: ', uri);
        return res.send(404);
      }

      new Link({ url: uri }).fetch().then(function(found) {
        if (found) {
          res.send(200, found.attributes);
        } else {
          util.getUrlTitle(uri, function(err, title) {
            if (err) {
              console.log('Error reading URL heading: ', err);
              return res.send(404);
            }

            var link = new Link({
              url: uri,
              title: title,
              base_url: req.headers.origin
            });

            link.save().then(function(newLink) {
              Links.add(newLink);
              res.send(200, newLink);
            });
          });
        }
      });
    } else {
      res.redirect(301, '/login');
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/signup', function (req, res){
  res.render('signup')
})

app.post('/signup', function (req, res){
  //TODO redirect to homepage?
  var username = req.body.username;
  var password = req.body.password;

  var user = new User({
    username: username,
    password: password
  });


  user.fetch().then(function (model) {
    if (!model) {
      user.save().then(function(data){
        //send session token along and redirect to main
        util.createSession(username, function(hash, userhash) {
          res.cookie('session', hash);
          res.cookie('userhash', userhash);
          res.redirect(301, '/');
        });
      }).catch(function(err){
        //if user exists send error messages to client
        console.log('everything is fine~ no really it is~');
        res.redirect(301, '/signup');
      });
    } else {
      //redirect to signup
      res.redirect(301, '/signup');
    }
  })


});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res){

  var username = req.body.username;
  var password = req.body.password;

  var user = new User({
    username: username
  });

  user.fetch().then(function (model) {
    if (model) {
      bcrypt.compare(password, model.get('password'), function(err, results) {
        if (results) {
          //send session token along and redirect to main
          util.createSession(username, function (hash, userhash) {
            res.cookie('session', hash);
            res.cookie('userhash', userhash);
            res.redirect(301, '/');
          });
        } else {
          res.redirect(301, '/login');
        }
      })
    }
  })
});

app.get('/logout', function(req, res) {
  res.cookie('userhash', { expires: new Date(1), path: '/'});
  res.cookie('session', { expires: new Date(1), path: '/'});
  res.redirect(301, '/login');
});




/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});


console.log('Shortly is listening on 4568');
app.listen(4568);
