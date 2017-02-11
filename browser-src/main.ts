import { h, appendToElement, removeElement } from "./typed-dom";
import * as $ from "jquery";
import { NavManager } from "./nav";
import { IntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment } from "./model/intraclinic-comment";
import * as service from "./service";
import { Post } from "./post";
import { PostForm } from "./post-form";
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
	nav: NavManager;

	constructor(user: User){
		this.user = user;
		if( !(user.isOwner() || user.isStaff()) ){
			this.dom = h.div({}, ["Login required."]);
			return;
		}
		let navMenu = h.div({}, []);
		let navWork = h.div({}, []);
		this.postsWrapper = h.div({}, []);
		this.nav = new NavManager(posts => { this.onPageChange(posts); }, navMenu, navWork);
		this.dom = h.div({}, [
			h.h1({}, ["院内ミーティング"]),
			this.userDisp(),
			this.editPart(),
			navMenu,
			navWork,
			this.nav.createDom(),
			this.postsWrapper,
			this.nav.createDom()
		]);
	}

	async setup(): Promise<void> {
		await this.nav.init();
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
			startEdit.addEventListener("click", event => {
				if( editorWrapper.firstChild !== null ){
					return;
				}
				let post = this.createNewIntraclinicPost();
				let form = new PostForm(post);
				form.onEnter = async () => {
					await service.enterIntraclinicPost(post.content, post.createdAt);
					editorWrapper.innerHTML = "";
					await this.nav.recalc();
					this.nav.triggerPageChange();
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

	private createNewIntraclinicPost(): IntraclinicPost {
		let post = new IntraclinicPost();
		post.createdAt = moment().format("YYYY-MM-DD");
		post.content = "";
		post.id = 0;
		return post;
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
			p.onEdit = this.makeOnEditCallback(p, post.post);
			p.onDelete = this.makeOnDeleteCallback(post.post.id);
			p.onEnterComment = this.makeOnEnterCommentCallback(p);
			wrapper.appendChild(p.dom);
		})
	}

	private makeOnEditCallback(post: Post, postModel: IntraclinicPost){
		return async () => {
			let form = new PostForm(postModel);
			form.onEnter = async () => {
				await service.updateIntraclinicPost(postModel.id, postModel.content);
				this.nav.triggerPageChange();
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
		};
	}

	private makeOnDeleteCallback(postId: number){
		return async () => {
			let comments = await service.listIntraclinicComments(postId);
			if( comments.length > 0 ){
				alert("コメントのある投稿は削除できません。");
				return;
			}
			if( !confirm("この投稿を削除していいですか？") ){
				return;
			}
			await service.deleteIntraclinicPost(postId);
			await this.nav.recalc();
			this.nav.triggerPageChange();
		}
	}

	private makeOnEnterCommentCallback(post: Post){
		return async (comment: IntraclinicComment) => {
			await service.enterIntraclinicComment(comment.name, comment.content, 
				comment.postId, comment.createdAt);
			let comments = await service.listIntraclinicComments(comment.postId);
			post.updateCommentsArea(comments);
		}
	}

}