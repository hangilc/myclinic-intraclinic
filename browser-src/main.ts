import { h } from "./typed-dom";
import * as $ from "jquery";

interface User {
	name: string;
	role: string;
	label: string;
}

$.ajax({
	url: "whoami",
	success: function(user){
		if( user === null ){
			user = {};
		}
		start(user);
	}
});

function start(user: User){
	let role = user.role;
	if( role === "owner" ){
		$("#newPostWrapper").css("display", "");
	}
}
