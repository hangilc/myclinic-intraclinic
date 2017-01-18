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
		if( name in userMap ){
			var user = userMap[name];
			if( pass === user.pass ){
				req.session.user = {
					name: name,
					role: user.role,
					label: user.label
				}
				res.redirect(req.baseUrl + "/");
				return;
			}
		}
		res.redirect(req.baseUrl + "/login.html?error");
	});
	app.get("/logout", function(req, res){
		if( req.session ){
			req.session.destroy();
		}
		res.redirect(req.baseUrl + "/login.html");
	});
	app.get("/", function(req, res, next){
		if( !(req.session && req.session.user) ){
			res.redirect(req.baseUrl + "/login.html");
			return;
		}
		next();
	});
	app.get("/whoami", function(req, res){
		if( req.session ){
			res.json(req.session.user || null);
		} else {
			res.json(null);
		}
	})

}
exports.initApp = initApp;
