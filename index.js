"use strict";
var path = require("path");
var session = require("express-session");

exports.staticDir = path.join(__dirname, "static");

var userMap = {};

function initApp(app, config, subpath) {
	userMap = config.users;
	var sessSecret = config["session-secret"] || Date.now() + "";
	app.use(session({
		secret: sessSecret,
		saveUninitialized: false,
		resave: false,
		httpOnly: false,
		path: subpath
	}));
	app.post("/login", function(req, res){
		var name = req.body.name;
		var pass = req.body.pass;
		if( name in userMap && pass === userMap[name].pass ){
			req.session.user = {
				name: name,
				role: userMap[name].role
			}
			res.redirect(req.baseUrl + "/");
		} else {
			res.redirect(req.baseUrl + "/login.html");
		}
	});
	app.get("/", function(req, res, next){
		if( !(req.session && req.session.user) ){
			res.redirect(req.baseUrl + "/login.html");
			return;
		}
		console.log(req.session.user);
		next();
	})
}
exports.initApp = initApp;
