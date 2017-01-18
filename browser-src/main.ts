import { h, appendToElement } from "./typed-dom";
import * as $ from "jquery";
import * as service from "./service";
import { NavManager } from "./nav";
import { Post } from "./post";
import { PostForm } from "./post-form";
import { IntraclinicPost } from "./model/intraclinic-post";
import * as moment from "moment";

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

function createNewIntraclinicPost(): IntraclinicPost {
	let post = new IntraclinicPost();
	post.createdAt = moment().format("YYYY-MM-DD");
	post.content = "";
	post.id = 0;
	return post;
}

function userDisp(name: string): HTMLElement{
	return h.div({"id": "newPostWrapper"}, [
		"ユーザー名：",
		name,
		" ",
		h.a({href: "logout"}, ["ログアウト"])
	])
}

function editPart(isOwner: boolean, onEnter: (id: number) => void): HTMLElement | null {
	if( isOwner ){
		let startEdit = h.a({}, ["新規投稿"]);
		let editorWrapper = h.div({}, []);
		startEdit.addEventListener("click", event => {
			if( editorWrapper.firstChild !== null ){
				return;
			}
			let post = createNewIntraclinicPost();
			let form = new PostForm(post);
			form.onEnter = async () => {
				let id = await service.enterIntraclinicPost(post.content, post.createdAt);
				editorWrapper.innerHTML = "";
				onEnter(id);
			};
			form.onCancel = () => {
				editorWrapper.innerHTML = "";
			}
			editorWrapper.appendChild(form.dom);
		})
		return h.div({}, [
			startEdit,
			editorWrapper
		])
	} else {
		return null;
	}
}

async function start(user: User){
	let role = user.role;
	let isOwner = false;
	if( role === "owner" ){
		isOwner = true;
	} else if( role === "staff" ){
		; // nop
	} else {
		return;
	}
	let navManager: NavManager = new NavManager();
	await adaptToNumberOfPostsChange();
	navManager.setOnPageChange(() => {
		updatePosts();
	});
	let postsWrapper = h.div({}, []);

	appendToElement(document.body, [
		h.h1({}, ["院内ミーティング"]),
		userDisp(user.label),
		editPart(isOwner, onEnter),
		navManager.createNav(),
		postsWrapper,
		navManager.createNav()
	]);
	navManager.triggerPageChange();

	async function onEnter(id: number){
		await adaptToNumberOfPostsChange();
		updatePosts();
	}

	async function adaptToNumberOfPostsChange(){
		let nPosts = await service.countIntraclinicPosts();
		navManager.updateTotalNumberOfPosts(nPosts);
	}

	async function updatePosts(){
		let posts = await service.listIntraclinicPosts(
			navManager.getCurrentOffset(), 
			navManager.getPostsperPage()
		);
		postsWrapper.innerHTML = "";
		posts.forEach(async post => {
			let comments = await service.listIntraclinicComment(post.id);
			let p = new Post(post, comments, isOwner);
			postsWrapper.appendChild(p.dom);
		})
	}
}

