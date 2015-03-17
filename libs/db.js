var mongoose = require('mongoose');

exports.isValidationError = function(err) {
	return (err && err.message && /ValidationError/i.test(err.name));
};

exports.isDuplicateKeyError = function(err) {
	return (err && err.message && /duplicatekey/i.test(err.name));
};

exports.connect = function(url, cb) {
	cb = cb || function(err) {
		if (err) {
			console.error('database connection failure: \n' + err.stack);
			process.exit(1);
		}
	};
	console.log('db launched');
	mongoose.connect(url, {safe: true }, cb);
};