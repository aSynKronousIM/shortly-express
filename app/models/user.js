var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function(){
    var context = this;
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(context.get('password'), salt, null, function (err, hash) {
        context.set('password', hash);
        context.set('salt', salt);
      });
    });
  }
});

module.exports = User;