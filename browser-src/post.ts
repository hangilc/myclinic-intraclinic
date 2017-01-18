import { h } from "./typed-dom";
import { IntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment } from "./model/intraclinic-comment";
import * as kanjidate from "kanjidate";

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

function commentPart(comments: IntraclinicComment[]): HTMLElement {
	return h.table({
		"width": "100%",
		"class": "commentListWrapper"
	}, [
		h.tbody({}, [
			h.tr({"valign": "top"}, [
				h.td({"width": "50%"}, comments.map(c => {
					return h.div({}, [
						c.name, " ", c.content
					])
				})),
				h.td({"width": "50%"}, [
					h.div({}, [
						"コメント追加",
						" ",
						h.input({"value": "閲覧しました。"}, []),
						" ",
						h.button({}, ["入力"])
					])
				])
			])
		])
	]);
}

export class Post {
	dom: HTMLElement;
	onEdit: () => void = () => {};
	onDelete: () => void = () => {};

	constructor(modelPost: IntraclinicPost, modelComments: IntraclinicComment[], isOwner: boolean){
		let editPart: HTMLElement | null = null;
		let editLink = h.a({"class": "cmd-link"}, ["編集"]);
		editLink.addEventListener("click", event => { this.onEdit() });
		let deleteLink = h.a({"class": "cmd-link"}, ["削除"]);
		deleteLink.addEventListener("click", event => { this.onDelete() });
		if( isOwner ){
			editPart = h.div({
				style: "border:1px solid #ccc; padding: 6px"
			}, [
				editLink,
				" ",
				deleteLink,
			]);
		}
		let content = h.div({"class": "content"}, formatContent(modelPost.content));
		let comment: HTMLElement | null = null;
		if( !isOwner ){
			comment = commentPart(modelComments);
		}
		this.dom = h.div({"class": "postWrapper"}, [
			h.div({"class": "dateLabel"}, [
				kanjidate.format(kanjidate.f1, modelPost.createdAt)
			]),
			editPart,
			content,
			comment
		]);
	}
}

