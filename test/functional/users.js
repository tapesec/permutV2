var app = require('../../server');
var should = require('should');
var db = require('../utils/db');

var request = require('supertest');
var should = require('should');
var db = require('../utils/db');

var user = require('../fixtures/users.json')[0];
var token = require('../fixtures/users-token');


describe('/users', function(done) {

	before(function(done) {
		db.setupDatabase(done);
	});

	after(function(done) {
		db.reset(done);
	});

	describe('POST', function(done) {
		it("Should sanitize userData before save them", function(done) {
			request(app)
			.post('/users')
			.send({
				username: "<script>tutu</script>lulu", 
				email: "tutu@gmail.com",
				password: "<div onclick=\"hack()\">loupou</div>",
				destination: ["lyon<style></style>", "<div onclick=\"hack()\">lyon</div>"]
				
			})
			.expect(201)
			//.expect('Location', /\/notes\/[0-9a-f]{24}/)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {throw err; }
				res.body.user.should.have.property('username', 'lulu');
				res.body.user.destination.should.containDeep(["lyon", "<div>lyon</div>"]);
				
				done();
			});
		});

		it("Should send a response error message 'Validation failed'", function(done) {
			request(app)
			.post('/users')
			.send({
				username: "tapesec",
				password: " ",
				email: " "
			})
			.expect(422)
			//.expect('Location', /\/notes\/[0-9a-f]{24}/)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {throw err; }
				
				res.body.should.have.property('errors', "Validation failed");
				done();
			});
		});

		it("Should send a response error message 'credentials required (username, password, email)'", function(done) {
			request(app)
			.post('/users')
			.send({
				username: "tapesec",
				password: ""
			})
			.expect(400)
			//.expect('Location', /\/notes\/[0-9a-f]{24}/)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {throw err; }
				res.body.should.have.property('errors', "credentials required (username, password, email)" );
				done();
			});
		});

		it("Should register a user", function(done) {
			request(app)
			.post('/users')
			.send({
				username: "tapesec",
				password: "wolf1umip",
				email: "lionel.dupouy@gmail.com"
			})
			.expect(201)
			.expect('Location', /\/users\/[0-9a-zA-Z]{3,255}/)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {throw err; }
				done();
			});
		});
	});
	
	describe('PATCH', function(done) {
		it("Should update a user with the correct values", function(done) {
			request(app)
			.patch('/users/toto')
			.set('Authorization', 'JWT '+ token)
			.send([
			  { "op": "replace", "path": "/email", "value": "rara@gmail.com" },
			  { "op": "add", "path": "/grade", "value": "GPX" },
			  { "op": "remove", "path": "/description"}
			])
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) { throw err; }

				res.body.should.have.property('message', 'User updated');
				res.body.should.containDeep({ 
					user: {
						username: "toto",
						email: "rara@gmail.com",
						grade: "GPX",
						description: undefined
					},
					message: 'User updated'});
				done();

			});
		});

		it("Should response an error if the data to update are invalid", function(done) {
			request(app)
			.patch('/users/toto')
			.set('Authorization', 'JWT '+ token)
			.send([
			  { "op": "bad_op", "path": "/email", "value": "rara@gmail.com" },
			  { "op": "add", "path": "/grade", "value": "Gardien de la paix" },
			  { "op": "remove", "path": "/description"}
			])
			.expect(400)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {throw err; }
				res.body.errors.should.containDeep(['Patch request must follow this pattern [{op: "replace || add ||remove", "path: "/field", value: "the value"}]']);
				done();
			});
		});

		it("Should response an error 'cannot update other users'", function(done) {
			request(app)
			.patch('/users/tutu')
			.set('Authorization', 'JWT '+ token)
			.send([
			  { "op": "replace", "path": "/email", "value": "rara@gmail.com" },
			  { "op": "add", "path": "/grade", "value": "Gardien de la paix" },
			  { "op": "remove", "path": "/description"}
			])
			.expect(403)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {throw err; }
				res.body.errors.should.containDeep(['cannot update other users']);
				done();
			});
		});

		it("Should respond an error if bad /path attribute", function(done) {
			request(app)
			.patch('/users/toto')
			.set('Authorization', 'JWT '+ token)
			.send([
			  { "op": "replace", "path": "/email", "value": "rara@gmail.com" },
			  { "op": "add", "path": "/badValue", "value": "wrongValue" },
			  { "op": "remove", "path": "/description"}
			])
			.expect(400)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {throw err; }
				
				res.body.errors.should.containDeep(['invalid /path value']);
				done();
			});
		});
		
	});
	
});