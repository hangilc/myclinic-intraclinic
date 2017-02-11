import { h, appendToElement } from "./typed-dom";
import { IntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment } from "./model/intraclinic-comment";
import { IntraclinicTag } from "./model/intraclinic-tag";
import * as kanjidate from "kanjidate";
import * as moment from "moment";

function formatContent(content: string): (string|HTMLElement)[] {
	let lines = content.split(/\r\n|\n|r/);
	let out: (string|HTMLElement)[] = [];
	for(let i=0;i<lines.length;i++){
		if( i !== 0 ){
			out.push(h.br({}, []));
		}
		out.push(lines[i]);
	}
	return out;
}

export class Post {
	dom: HTMLElement;
	commentsWrapper: HTMLElement;
	onEdit: () => void = () => {};
	onDelete: () => void = () => {};
	onEnterComment: (comment: IntraclinicComment) => void = _ => {};
	private modelPost: IntraclinicPost;
	private modelComments: IntraclinicComment[];
	private isOwner: boolean;
	private userName: string;

	constructor(modelPost: IntraclinicPost, modelComments: IntraclinicComment[], 
		tags: IntraclinicTag[], isOwner: boolean, userName: string){
		this.modelPost = modelPost;
		this.modelComments = modelComments;
		this.isOwner = isOwner;
		this.userName = userName;
		this.commentsWrapper = h.div({}, [this.commentPart()]);
		this.dom = h.div({"class": "postWrapper"}, [
			this.datePart(),
			this.editPart(),
			this.contentPart(),
			this.tagPart(tags),
			this.commentsWrapper
		]);
	}

	async updateCommentsArea(comments: IntraclinicComment[]): Promise<void> {
		this.modelComments = comments;
		this.commentsWrapper.innerHTML = "";
		appendToElement(this.commentsWrapper, [this.commentPart()]);
	}

	private datePart(): HTMLElement {
		return h.div({"class": "dateLabel"}, [
			kanjidate.format(kanjidate.f1, this.modelPost.createdAt)
		])
	}

	private editPart(): HTMLElement | null {
		if( this.isOwner ){
			let editLink = h.a({"class": "cmd-link"}, ["編集"]);
			editLink.addEventListener("click", event => { this.onEdit() });
			let deleteLink = h.a({"class": "cmd-link"}, ["削除"]);
			deleteLink.addEventListener("click", event => { this.onDelete() });
			return h.div({
				style: "border:1px solid #ccc; padding: 6px"
			}, [
				editLink,
				" ",
				deleteLink,
			]);
		} else {
			return null;
		}
	}

	private contentPart(): HTMLElement {
		return h.div({"class": "content"}, 
			formatContent(this.modelPost.content));
	}

	private tagPart(tags: IntraclinicTag[]): HTMLElement | null {
		if( tags.length === 0 ){
			return null;
		} else {
			return h.div({
				style: "border:1px solid #ccc; padding: 6px"
			}, [
				"タグ： ",
				...interpose<HTMLElement|string>(" ", tags.map(tag => {
					return tag.name;
				}))
			]);
		}

		function interpose<T>(e:T, arr: T[]): T[] {
			let result: T[] = [];
			arr.forEach((a:T, index:number) => {
				result.push(a);
				if( index !== (arr.length - 1) ){
					result.push(e);
				}
			})
			return result;
		}
	}

	private commentPart(): HTMLElement {
		return h.table({
			"width": "100%",
			"class": "commentListWrapper"
		}, [
			h.tbody({}, [
				h.tr({"valign": "top"}, [
					h.td({"width": "50%"}, this.modelComments.map(c => {
						return h.div({}, [
							c.name, " ", c.content
						])
					})),
					h.td({"width": "50%"}, [
						this.commentFormPart()
					])
				])
			])
		]);
	}

	private commentFormPart(): HTMLElement {
		let input = h.input({"value": this.defaultInputValue()}, []);
		let enterButton = h.button({}, ["入力"]);
		enterButton.addEventListener("click", event => {
			let c = new IntraclinicComment();
			c.name = this.userName;
			c.content = input.value.trim();
			c.postId = this.modelPost.id;
			c.createdAt = moment().format("YYYY-MM-DD");
			if( c.content === "" ){
				alert("コメントの内容が入力されていません。");
				return;
			}
			this.onEnterComment(c);
		})
		return h.div({}, [
			"コメント追加",
			" ",
			input,
			" ",
			enterButton
		])
	}

	private defaultInputValue(): string {
		if( this.isOwner ){
			return "";
		} else {
			let value: string = "";
			let hasSeen = false;
			let comments = this.modelComments;
			let userName = this.userName;
			for(let i=0;i<comments.length;i++){
				let c = comments[i];
				if( c.name === userName && c.content === "閲覧しました。" ){
					hasSeen = true;
					break;
				}
			}
			return hasSeen ? "" : "閲覧しました。";
		}
	}
}

