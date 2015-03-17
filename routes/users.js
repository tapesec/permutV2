var _ = require('lodash');
var db = require('../libs/db');
//var response = require('./responses');
/**
* Retourne la liste des utilisateurs
**/
exports.showAll = function(req, res, next) {
	req.User.find(function(err, userData) {
		if (err) { res.status(500).send(err); }
		if (!userData) { return res.status(204).end(); }
		
		var listeUser = [];
		userData.forEach(function(elem, i, array) {
			listeUser.push(_.pick(array[i], ['username', 'email']));
		});
		res.status(200).send(listeUser);
	});
};

/**
* Crée un utilisateur
**/
exports.create = function(req, res, next) {
	if(!req.body.email || !req.body.password || !req.body.username)
		return res.status(400).send({ errors: "credentials required (username, password, email)" });

	var data = _.pick(req.body, ['username', 'email', 'password', 'destination']);
	var newUser = new req.User(data);
	req.User.register(newUser, data.password, function(err, userData) {
		if (err) {
			if (db.isValidationError(err)) {
				res.status(422).send({ errors: err.message });
			} else if (db.isDuplicateKeyError(err)) {
				res.status(422).send({ errors: err.message });
			} else {
				res.status(422).send({ errors: err.message });
			}
		} else {
			var data = _.pick(userData, ['username', 'email', 'checked', 'destination']);
			res.status(201);
			res.set('Location', '/users/' + userData.username);
			res.send({user : data, message: "Confirmation email sent to the created user (check spams)"});
		}
	});
};


/**
* Met à jour un utilisateur en fonction de son username
**/
exports.update = function(req, res, next) {
	
	function saveAndRespond(user) {

		user.save(function(err, userData) {
			if (err) {
				if (db.isValidationError(err)) {
					res.status(422).send({ errors: ['invalid data'] });
				} else if (db.isDuplicateKeyError(err)) {
					res.status(422).send({ errors: ['username/email already exists'] });
				} else {
					res.status(422).send({ errors: err.message });
				}
			} else {

				res.status(200).send({ user: userData, message: "User updated" });
			}	
		});
	}

	if (req.params.username !== req.user.username && req.user.status < 10) {
		return res.status(403).send({ errors: ['cannot update other users'] });
	} else {

		if (!Array.isArray(req.body)) {
			return res.status(400).send({ errors: ['use JSON Patch'] });
		} else {
			if (req.body.some(function(item) {
				if (item.value)
					return !((item.op && item.path && item.value) && (item.op == 'replace' || item.op == 'add' || item.op == 'remove'));
				else
					return !((item.op && item.path) && (item.op == 'replace' || item.op == 'add' || item.op == 'remove')); }
			)) 
			{
				return res.status(400).send({ errors: ['Patch request must follow this pattern [{op: "replace || add ||remove", "path: "/field", value: "the value"}]'] });
			} else {
				req.User.findOne({ username: req.user.username }, function(err, user) {
					if (err) { return next(err); }
					if (!user) {
						return res.status(404).send({ errors: ['no such user']});
					}

					var schema = req.User.schema.tree;
					if (req.body.some(function(attr) {
						var requestAttr = attr.path.replace(/^\//,'');
						if(schema.hasOwnProperty(requestAttr)) {
							if (attr.op == 'replace' || attr.op == 'add') {
								user[requestAttr] = attr.value;
							} else if (attr.op == 'remove') {
								user[requestAttr] = undefined;
							}
						} else {
							return true;
						}
					})) {
						return res.status(400).send({ errors: ['invalid /path value']});
					}

					if (user.password) {
						var password = user.password;
						delete user.password;

						user.setPassword(password, function(err) {
							if (err) { return next(err); }
							saveAndRespond(user);
						});
					} else {
						saveAndRespond(user);
					}
				});
			}
		}

	}
};