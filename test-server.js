var web = require("myclinic-web");
var subapp = require("./index.js");

var sub = {
	name: "intraclinic",
	module: subapp,
	configKey: "intraclinic"
};

web.cmd.runFromCommand([sub], {port: 9004});
