var validator = require('../../libs/validator');
var mocha = require('mocha');
var should = require('should');
var assert = require('assert');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
require('clarify');


describe("Model validator", function() {
	
	describe("Validate", function() {
		
		it("Should throw an exception if the validation method doesn't exist", 
			function() {
				delete validator.wrongMethod;
				(function() {
					validator.validate('wrongMethod');
				}).should.throw(/Validation method doesn't exist/i);
			}
		);

		it("Should return a function",
			function() {
				validator.trivialFunction = function() {};
				(validator.validate('trivialFunction')).should.be.a.Function;
			}
		);

		it("Should called one single time",
			function() {
				var noop = sinon.stub();
				var memoize = sinon.spy(function() {
					return noop;
				});
				var validator = proxyquire('../../libs/validator', {'memoizejs': memoize});
				memoize.calledOnce.should.be.true;
				validator.validate.should.eql(noop);

			}
		);

	});
});