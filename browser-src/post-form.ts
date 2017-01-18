import { h } from "./typed-dom";
import { IntraclinicPost } from "./model/intraclinic-post";
import * as kanjidate from "kanjidate";

export class PostForm {
	dom: HTMLElement;
	onEnter: () => void = () => {};
	onCancel: () => void = () => {};

	constructor(post: IntraclinicPost){
		let content = h.textarea({"rows": "16", "cols": "40"}, []);
		let enter = h.button({}, ["入力"]);
		enter.addEventListener("click", event => {
			post.content = content.value;
			this.onEnter();
		});
		let cancel = h.button({}, ["キャンセル"]);
		cancel.addEventListener("click", event => {
			this.onCancel();
		});
		this.dom = h.form({}, [
			h.div({}, [kanjidate.format(kanjidate.f1, post.createdAt)]),
			content,
			h.div({}, [
				enter,
				" ",
				cancel
			])
		]);
	}
}

