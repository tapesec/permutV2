var express = require('express');
var app = express();
var db = require('./libs/db');
var config = require('./config')[app.get('env') || "development"];
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var routes = require('./routes');
var morgan = require('morgan');
var fs = require('fs');
var errorhandler = require('errorhandler');
require('clarify');


var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

db.connect(config.mongoUrl);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



app.use(require('response-time')());
app.use(morgan('dev'));
app.use(morgan('common', {stream: accessLogStream}));

app.use(methodOverride(function(req, res) {
	if(req.body && typeof req.body === "object" && "_method" in req.body) {
		var method = req.body._method;
		delete req.body._method;
		return method;
	}
}));

app.use(function(req, res, next) {
	req.User = require('./models/user');
	next();
});


if (process.env.NODE_ENV === 'development')
	app.use(errorhandler({ log: function (err, str, req) { var title = 'Error in ' + req.method + ' ' + req.url; }}));

/*process.on('uncaughtException', function (err) {
	console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
	process.exit(1);
});*/


// inscription ..
app.post("/users", routes.users.create);
// authentification ..
app.post("/sessions", routes.auth.localAuthenticate, routes.auth.sendToken);
app.get("/users", routes.auth.jwtAuthenticate, routes.users.showAll);
app.patch("/users/:username", routes.auth.jwtAuthenticate, routes.users.update);


module.exports = app;

if(!module.parent) {
	var masterApp = express();
	masterApp.use('/api/v1/', app);
	masterApp.listen(config.port);
	console.log('(%s) app listening on port %s', app.get('env'), config.port);
}