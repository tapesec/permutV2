var mongoose = require('mongoose');
var validator = require('../libs/validator');
var timestamps = require('mongoose-timestamp');
var passportLocalMongoose = require('passport-local-mongoose');
var utils = require('./utils');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var sanitize = require('google-caja').sanitize;
var async = require('async');

var User = new Schema({

	username: {
		type: String,
		required: true,
		unique: true,
		validate: [{
			validator: validator.validate('isAlphanumeric'),
			msg: 'username must be alphanumeric'
		}, {
			validator: validator.validate('isLength', 3, 255),
			msg: 'username must have 3-255 chars'
		}]
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate: validator.validate('isEmail')
	},
	corps: {
		type: String,
		validate: validator.validate('isLength', 2, 3)
	},
	grade: { 
		type: String,
		validate: validator.validate('isLength', 3, 15)
	},
	dateAdmin: { 
		type: Date
	},
	promotion: {
		type: Number,
		min: 90
	},
	dateGrade: { 
		type: Date 
	},
	residence: { 
		type: String 
	},
	service: { 
		type: String 
	},
	description: { 
		type: String,
		validate: validator.validate('isLength', 5, 1000) 
	},
	destination: [],
	dateConnexion: {
		type: Date 
	},
	lastSearch: { 
		type: Date 
	},
	status: { 
		type: Number, 
		default: 1 
	},
	tokken: { 
		type: String,
		select: false
	},
	checked: { 
		type: Boolean,
		default: false
	},
	ready: { 
		type: Boolean, 
		default: false
	}
});

User.plugin(passportLocalMongoose);
User.plugin(timestamps);

User.pre('validate', function(next) {
	var entity = this._doc;
	var fields = ['username',
				'email',
				'corps',
				'grade',
				'dateAdmin',
				'dateGrade',
				'residence',
				'service',
				'description',
				'destination', 
				'dateConnexion',
				'lastSearch',
				'status',
				'token',
				'checked',
				'ready'];
				
	async.each(fields, function(field, cb) {
		if(entity[field] != undefined) {

			if (Array.isArray(entity[field])) {
				for (var i = 0; i < entity[field].length; i++) {
					entity[field][i] = sanitize(entity[field][i]);
				}
			} else {
				entity[field] = sanitize(entity[field]);
			}
		}
		cb();
	}, function(err) {
		if (err) next(err);
		next();
	});
});

if(User.options) {
	if (!User.options.toObject) User.options.toObject = {};
		User.options.toObject.transform = function (doc, ret, options) {
  			// remove the _id of every document before returning the result
  			delete ret.salt;
  			delete ret.hash;
		};
}

module.exports = mongoose.model('User', User);