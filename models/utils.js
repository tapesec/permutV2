var async = require('async');
var sanitize = require('google-caja').sanitize;


exports.sanitize = function(obj, cb) {
	var fields = Object.keys(obj);
	async.each(fields, function(field, cb) {
		if (obj[field] instanceof Object) {
			exports.sanitize(obj[field], function(err) {
				cb();
			});
		} else {
			obj[field] = sanitize(obj[field]);
			cb();
		}
	}, function(err) {
		if (err) return cb(err);
		return cb(null);
	});
};