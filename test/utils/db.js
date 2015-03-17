var config = require('../../config.json');
var db = require('../../libs/db');
var async = require('async');
var User = require('../../models/user');
var userFixtures = require('../fixtures/users.json');


exports.connect = function(callback) {
	db.connect(config.test.mongoUrl, callback);
};

exports.reset = function(callback) {
	async.parallel([
	function emptyUsersCollection(cb) {
		User.remove({}, cb);
	}], callback);
};

exports.populate = function(callback) {
	async.each(userFixtures, function(data, next) {
		User.register(new User({
			username: data.username,
			email: data.email
		}), data.password, next);
	}, function(err) {
		if (err) { return callback(err); }
		callback();
	});
};

exports.setupDatabase = function(callback) {
	exports.reset(function(err) {
		if (err) { return callback(err); }
		exports.populate(callback);
	});
};