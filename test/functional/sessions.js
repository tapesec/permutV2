var app = require('../../server');
var should = require('should');
var db = require('../utils/db');

var request = require('supertest');

var user = require('../fixtures/users.json')[0];

describe('/sessions', function(done) {
	before(function(done) {
		db.setupDatabase(done);
	});

	after(function(done) {
		db.reset(done);
	});

	it("should return a valid jwt token and the granted user profile", function(done) {
		request(app)
			.post('/sessions')
			.send({ username: user.username, password: user.password})
			.expect(201)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if(err) { throw err; }
				res.body.should.have.properties('auth_token', 'user_granted');
				res.body.user_granted.should.have.properties('_id', 'username', 'email');
				done();
			});
	});

	it("should return a 401 unauthorized code and an invalid credentials message", function(done) {
		request(app)
			.post('/sessions')
			.send({ username: "wrong_login", password: "wolf"})
			.expect(401)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if(err) { throw err; }
				res.body.should.have.property("message", "Invalid credential");
				done();
			});
	});

	it("should return a 400 badRequest code and a missing credentials message", function(done) {
		request(app)
			.post('/sessions')
			.send({ wrong_username_attr: "tapesec", wrong_password_attr: "wolf"})
			.expect(400)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if(err) { throw err; }
				res.body.should.have.property("message", "Missing credentials");
				done();
			});
	});
});
