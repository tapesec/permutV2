var jwt = require('jsonwebtoken');
var config = require('../../config').test;
var user = require('./users')[0];
var token = jwt.sign(user, config.salt);

module.exports = token;