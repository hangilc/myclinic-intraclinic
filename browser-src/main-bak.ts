/*
import { h, appendToElement, removeElement } from "./typed-dom";
import * as $ from "jquery";
import * as service from "./service";
import { NavManager } from "./nav";
import { Post } from "./post";
import { PostForm } from "./post-form";
import { IntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment } from "./model/intraclinic-comment";
import * as moment from "moment";

class User {
	name: string;
	role: string;
	label: string;

	constructor(name: string, role: string, label: string){
		this.name = name;
		this.role = role;
		this.label = label;
	}

	isOwner(): boolean {
		return this.role === "owner";
	}

	isStaff(): boolean {
		return this.role === "staff";
	}
}

// $.ajax({
// 	url: "whoami",
// 	success: function(user){
// 		if( user === null ){
// 			user = {};
// 		}
// 		let main = new Main(user);
// 		document.body.appendChild(main.dom);
// 	}
// });

class Main {
	dom: HTMLElement;

	constructor(user: User){
		if( user.isOwner() ){
			alert("owner");
			this.dom = h.div({}, ["Owner"]);
		} else if( user.isStaff() ){
			this.dom = h.div({}, ["Staff"]);
		} else {
			this.dom = h.div({}, ["Login required."]);
		}
	}
}

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
	navManager.setOnPageChange((posts: IntraclinicPost[]) => {
		updatePosts(posts);
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
		fullUpdate();
	}

	async function fullUpdate(){
		await adaptToNumberOfPostsChange();
		//updatePosts();
	}

	async function adaptToNumberOfPostsChange(){
		let nPosts = await service.countIntraclinicPosts();
		//navManager.updateTotalNumberOfPosts(nPosts);
	}

	async function updatePosts(posts: IntraclinicPost[]){
		postsWrapper.innerHTML = "";
		for(let i=0;i<posts.length;i++){
			let post = posts[i];
			let postId = post.id;
			let comments = await service.listIntraclinicComments(postId);
			let p = new Post(post, comments, isOwner, user.label);
			p.onEdit = makeOnEditCallback(p, post, fullUpdate);
			p.onDelete = makeOnDeleteCallback(postId, fullUpdate);
			//p.onEnterComment = makeOnEnterCommentCallback(updatePosts);
			postsWrapper.appendChild(p.dom);
		};
	}
}

function makeOnEditCallback(post: Post, postModel: IntraclinicPost,
	updater: () => void){
	return async function(){
		let form = new PostForm(postModel);
		form.onEnter = async () => {
			await service.updateIntraclinicPost(postModel.id, postModel.content);
			updater();
		};
		form.onCancel = () => {
			removeElement(form.dom);
			post.dom.style.display = "";
		}
		post.dom.style.display = "none";
		let parent = post.dom.parentNode;
		if( parent !== null ){
			parent.insertBefore(form.dom, post.dom);
		}
	}
}

function makeOnDeleteCallback(postId: number, updater: () => void){
	return async function(){
		let comments = await service.listIntraclinicComments(postId);
		if( comments.length > 0 ){
			alert("コメントのある投稿は削除できません。");
			return;
		}
		if( !confirm("この投稿を削除していいですか？") ){
			return;
		}
		await service.deleteIntraclinicPost(postId);
		updater();
	}
}

function makeOnEnterCommentCallback(updater: () => void){
	return async function(comment: IntraclinicComment){
		await service.enterIntraclinicComment(comment.name, comment.content, 
			comment.postId, comment.createdAt);
		updater();
	}
}

*/