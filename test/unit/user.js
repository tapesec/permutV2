var sinon = require('sinon');
var proxyquire = require('proxyquire');
var helpers = require('../utils/helpers');
var mongoose = helpers.getMongooseStub();

var shouldDefineSchemaProperty = helpers.shouldDefineSchemaProperty.bind(null, mongoose.Schema);
var shouldRegisterSchema = helpers.shouldRegisterSchema.bind(null, mongoose.model, mongoose.Schema);
var shouldBeRequired = helpers.shouldBeRequired.bind(null, mongoose.Schema);
var shouldBeA = helpers.shouldBeA.bind(null, mongoose.Schema);
var shouldDefaultTo = helpers.shouldDefaultTo.bind(null, mongoose.Schema);
var shouldBeBetween = helpers.shouldBeBetween.bind(null, mongoose.Schema);
var shouldValidateThat = helpers.shouldValidateThat.bind(null, mongoose.Schema);
var shouldValidateMany = helpers.shouldValidateMany.bind(null, mongoose.Schema);
var shouldLoadPlugin = helpers.shouldLoadPlugin.bind(null, mongoose.Schema);
var shouldBeUnique = helpers.shouldBeUnique.bind(null, mongoose.Schema);
var shouldBeMin = helpers.shouldBeMin.bind(null, mongoose.Schema);


describe('User', function() {
	var User, mongooseTimestamp;

	before(function() {
		mongooseTimestamp = sinon.stub();
		User = proxyquire('../../models/user', {
			'mongoose-timestamp': mongooseTimestamp,
			'mongoose': mongoose
		});
	});
	// the tests will be included here

	it('Should register the Mongoose model', function() {
		shouldRegisterSchema('User');
	});

	describe('username', function() {
		it('should be a string', function() {
			shouldBeA('username', String);
		});

		it('should be required', function() {
			shouldBeRequired('username');
		});

		it('should be unique', function() {
			shouldBeUnique('username');
		});

		it('should be Alphanumeric and between 3 and 255', function() {
			shouldValidateMany('username', {
					args: ['isAlphanumeric'],
					msg: "username must be alphanumeric"
				}, {
					args: ['isLength', 3, 255],
					msg: "username must have 3-255 chars"
				}
			);
		});

	});

	describe('email', function() {
		it('should be a string', function() {
			shouldBeA('email', String);
		});

		it('should be required', function() {
			shouldBeRequired('email');
		});

		it('should be unique', function() {
			shouldBeUnique('email');
		});

		it('should be an email', function() {
			shouldValidateThat('email', 'isEmail');
		});

	});

	describe('corps', function() {
		it('should be a string', function() {
			shouldBeA('corps', String);
		});

		it('should between 2 - 3 chars', function() {
			shouldValidateThat('corps', 'isLength', 2, 3);
		});
	});

	describe('promotion', function() {
		it('should be a number', function() {
			shouldBeA('promotion', Number);
		});

		it('Should be min 90', function() {
			shouldBeMin('promotion', 90);
		});
	});

	describe('grade', function() {
		it('should be a string', function() {
			shouldBeA('grade', String);
		});

		it('should between 3 - 15 chars', function() {
			shouldValidateThat('grade', 'isLength', 3, 15);
		});
	});

	describe('description', function() {
		it('should be a string', function() {
			shouldBeA('description', String);
		});

		it('should between 5 - 1000 chars', function() {
			shouldValidateThat('description', 'isLength', 5, 1000);
		});
	});

});