var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var jwt = require('jsonwebtoken');
var config = require('../config').development;
var User = require('../models/user');
var _ = require('lodash');


/**
* Strategie d'authentification par login mot de passe simple.
* Etape initiale pour ensuite générer un Json Web Tokken et le renvoyer au client
**/
passport.use(new LocalStrategy(User.authenticate()));

/**
* Strategie d'authentification par web tokken envoyé par le client à chque requête vers une ressource protégée
**/
passport.use(new JwtStrategy(config.salt, function(jwt_paylaod, done) {
    User.findOne({id: jwt_paylaod.sub}, function(err, user) {
        if (err) { return done(err, false); }
        if (user) { done(null, user);  } else { done(null, false); }
    });
}));

/**
* Authentifie par login mot de passe un utilisateur
**/
exports.localAuthenticate = function(req, res, next) {
	/*if(!req.body.username || !req.body.password)
		return res.status(401).send({ message: "credential required (username, password)" });
	*/
	passport.authenticate('local',{ session: false }, function(err, user, info) {
		if(info)
			if (info.message == "Missing credentials") { return res.status(400).send({ message: info.message }); }

		if (err) { return next(err); }
    	if (!user) { return res.status(401).send({ message: "Invalid credential" }); }
    	req.user = user;
    	next();
	})(req, res, next);
};

/**
* Retourne un jwt en réponse ainsi que l'utilisateur acredité
**/
exports.sendToken = function(req, res, next) {
	var user = _.pick(req.user, ['_id', 'username', 'email']);
	var token = jwt.sign(user, config.salt);
	res.status(201).send({ auth_token: token, user_granted: _.pick(req.user, ['_id', 'username', 'email']) });
};

/**
* Authentifie par jwt un utilisateur
**/
exports.jwtAuthenticate = function(req, res, next) {
	passport.authenticate('jwt', { session: false }, function(err, user, info) {
		if (err) { return next(err); }
    	if (!user) { return res.status(401).send({ message: "Invalid token" }); }
    	req.user = user;
    	next();
	})(req, res, next);
};