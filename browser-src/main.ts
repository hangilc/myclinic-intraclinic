import { h, appendToElement, removeElement } from "./typed-dom";
import * as $ from "jquery";
import { Nav } from "./nav";
import { IntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment } from "./model/intraclinic-comment";
import * as service from "./service";
import { Post } from "./post";

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

$.ajax({
	url: "whoami",
	success: function(user){
		if( user === null ){
			user = {};
		}
		let main = new Main(new User(user.name, user.role, user.label));
		document.body.appendChild(main.dom);
		main.setup();
	}
});

class PostWithComments {
	constructor(public post: IntraclinicPost, public comments: IntraclinicComment[]){}
}

class Main {
	dom: HTMLElement;
	postsWrapper: HTMLElement;
	user: User;
	nav: Nav;

	constructor(user: User){
		this.user = user;
		if( !(user.isOwner() || user.isStaff()) ){
			this.dom = h.div({}, ["Login required."]);
			return;
		}
		this.nav = new Nav();
		this.nav.setOnPageChange(posts => { this.onPageChange(posts); })
		this.postsWrapper = h.div({}, []);
		this.dom = h.div({}, [
			h.h1({}, ["院内ミーティング"]),
			this.userDisp(),
			this.editPart(),
			this.nav.createDom(),
			this.postsWrapper,
			this.nav.createDom()
		]);
	}

	async setup(): Promise<void> {
		await this.nav.update();
		this.nav.triggerPageChange();
	}

	private userDisp(): HTMLElement {
		return h.div({"id": "newPostWrapper"}, [
			"ユーザー名：",
			this.user.name,
			" ",
			h.a({href: "logout"}, ["ログアウト"])
		])
	}

	private editPart(): HTMLElement | null {
		if( this.user.isOwner() ){
			let startEdit = h.a({}, ["新規投稿"]);
			let editorWrapper = h.div({}, []);
			// startEdit.addEventListener("click", event => {
			// 	if( editorWrapper.firstChild !== null ){
			// 		return;
			// 	}
			// 	let post = createNewIntraclinicPost();
			// 	let form = new PostForm(post);
			// 	form.onEnter = async () => {
			// 		let id = await service.enterIntraclinicPost(post.content, post.createdAt);
			// 		editorWrapper.innerHTML = "";
			// 		onEnter(id);
			// 	};
			// 	form.onCancel = () => {
			// 		editorWrapper.innerHTML = "";
			// 	}
			// 	editorWrapper.appendChild(form.dom);
			// })
			return h.div({}, [
				startEdit,
				editorWrapper
			])
		} else {
			return null;
		}
	}

	private onPageChange(posts: IntraclinicPost[]): void {
		this.postsWrapper.innerHTML = "";
		Promise.all(posts.map(async post => {
			let comments = await service.listIntraclinicComments(post.id);
			return new PostWithComments(post, comments);
		}))
		.then((posts: PostWithComments[]) => {
			this.renderPosts(posts);
		})
		.catch(err => {
			console.log(err);
		})
	}

	private renderPosts(posts: PostWithComments[]): void{
		let wrapper = this.postsWrapper;
		posts.forEach(post => {
			let p = new Post(post.post, post.comments, this.user.isOwner(), this.user.label);
			wrapper.appendChild(p.dom);
		})
	}
}