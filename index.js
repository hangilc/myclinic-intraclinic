"use strict";
var path = require("path");
var session = require("express-session");

exports.staticDir = path.join(__dirname, "static");

function initApp(app, config, subpath) {
	console.log("subpath", subpath);
	var sessSecret = config["session-secret"] || Date.now() + "";
	app.use(session({
		secret: sessSecret,
		saveUninitialized: false,
		resave: false,
		httpOnly: false,
		path: subpath
	}))
    app.get("/config", function (req, res) {
        res.set({
            "Content-Type": "text/javascript"
        });
        res.send("var config = " + JSON.stringify(config) + ";");
    });
}
exports.initApp = initApp;
