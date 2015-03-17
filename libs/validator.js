var validator = require('validator');
var extend = require('lodash').extend;
var memoize = require('memoizejs');

var customValidator = extend({}, validator);

customValidator.validate = function(method) {
	if( !customValidator[method] ) { 
		throw new Error("Validation method doesn't exist"); 
		process.exit(1); 
	}

	var args = Array.prototype.slice.call(arguments, 1);
	return function(value) {
		return customValidator[method].apply(customValidator, Array.prototype.concat(value, args));
	}
};

customValidator.validate = memoize(customValidator.validate);
module.exports = customValidator;