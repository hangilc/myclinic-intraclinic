import { h, appendToElement } from "./typed-dom";
import { IntraclinicTag } from "./model/intraclinic-tag";
import * as service from "./service";

interface TagFormCallbacks {
	onNewTag: (tagId: number) => Promise<void>;
}

export class TagForm {
	dom: HTMLElement;
	private workarea: HTMLElement;
	private callbacks: TagFormCallbacks;

	constructor(callbacks: TagFormCallbacks){
		this.callbacks = callbacks;
		this.workarea = h.div({}, []);
		this.dom = h.div({}, [
			this.createMenu(),
			this.workarea
		]);
	}

	private createMenu(): HTMLElement {
		let newTag = h.a({}, ["新規タグ"]);
		newTag.addEventListener("click", event => {
			this.workarea.innerHTML = "";
			appendToElement(this.workarea, [
				this.newTagForm()
			])
		});
		return h.div({}, [
			newTag, " ",
		])
	}

	private newTagForm(): HTMLElement {
		let input = h.input({size: 8}, []);
		let button = h.button({}, ["入力"]);
		button.addEventListener("click", async event => {
			let text = input.value.trim();
			if( text === "" ){
				return;
			}
			let newTagId = await service.createIntraclinicTag(text);
			if( this.callbacks.onNewTag ){
				this.callbacks.onNewTag(newTagId);
			}
		});
		return h.form({}, [
			"タグ名：",
			input,
			" ",
			button
		]);
	}
}