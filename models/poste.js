var mongoose = require('mongoose');
var validator = require('../libs/validator');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Poste = new Schema({

	label: {
		type: String
	},
	departement: {
		type: String
	},
	codePostal: {
		type: String
	},
	geocodage_espg: {
		type: Number
	},
	geocodage_x: {
		type: Number
	},
	geocodage_y: {
		type: Number
	},
	geocodage_x_GPS: {
		type: Number
	},
	geocodage_y_GPS: {
		type: Number
	}

});

if(Poste.options) {
	if (!Poste.options.toObject) Poste.options.toObject = {};
		Poste.options.toObject.transform = function (doc, ret, options) {
  			// remove the _id of every document before returning the result
  			delete ret._id;
  			delete ret.__v;
		};
}

module.exports = mongoose.model('Poste', Poste);