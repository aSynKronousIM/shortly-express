var request = require('request');
var bcrypt = require('bcrypt-nodejs');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

exports.createSession = function(username, cb) {
  bcrypt.hash(username, null, null, function (err, userhash) {

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(userhash, salt, null, function (err, hash) {
        cb(hash, userhash);
      });
    });

  });
};

exports.checkSession = function(req, cb) {
  cb(true);
  // if(!req.cookies.userhash) {
  //   cb(false);
  // } else {
  //   bcrypt.compare(req.cookies.userhash, req.cookies.session, function(err, result) {
  //     if(!result){
  //     }
  //     cb(result);
  //   })
  // }
};

