import { h } from "./typed-dom";
import * as $ from "jquery";
import * as service from "./service";
import { NavManager } from "./nav";
import { Post } from "./post";

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

function setUserName(name){
	let e = document.getElementById("user-name");
	if( e !== null ){
		e.innerHTML = "";
		let txt = document.createTextNode(name);
		e.appendChild(txt);
	}
}


async function start(user: User){
	let role = user.role;
	let isOwner = false;
	if( role === "owner" ){
		$("#newPostWrapper").css("display", "");
		isOwner = true;
	} else if( role === "staff" ) {

	} else {
		return;
	}
	setUserName(user.label);
	let navManager: NavManager = new NavManager();
	navManager.setOnPageChange(() => {
		updatePosts();
	})
	let nPosts = await service.countIntraclinicPosts();
	navManager.updateTotalNumberOfPosts(nPosts);
	setupNavs();
	navManager.triggerPageChange();

	function setupNavs(){
		let els = document.querySelectorAll(".nav");
		for(let i=0;i<els.length;i++){
			let e = els[i];
			e.appendChild(navManager.createNav());
		}
	}

	async function updatePosts(){
		let posts = await service.listIntraclinicPosts(
			navManager.getCurrentOffset(), 
			navManager.getPostsperPage()
		);
		let wrapper = document.getElementById("postListWrapper");
		if( wrapper !== null ){
			let realWrapper = <HTMLElement>wrapper;
			realWrapper.innerHTML = "";
			posts.forEach(async post => {
				let comments = await service.listIntraclinicComment(post.id);
				let p = new Post(post, comments, isOwner);
				realWrapper.appendChild(p.dom);
			})
		}
	}
}

