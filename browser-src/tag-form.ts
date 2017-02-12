import { h, appendToElement } from "./typed-dom";
import { IntraclinicTag } from "./model/intraclinic-tag";
import * as service from "./service";

interface TagFormCallbacks {
	onNewTag?: (tagId: number) => Promise<void>;
	onDelTag?: (tagIds: number[]) => Promise<void>;
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
		let delTag = h.a({}, ["タグ削除"]);
		delTag.addEventListener("click", async event => {
			this.workarea.innerHTML = "";
			let form = await this.delTagForm();
			appendToElement(this.workarea, [form]);
		})
		return h.div({}, [
			newTag, " | ",
			delTag
		])
	}

	private newTagForm(): HTMLElement {
		let input = h.input({size: 12}, []);
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

	private async delTagForm(): Promise<HTMLElement> {
		let tags = await service.listIntraclinicTag();
		let items = await Promise.all(tags.map(tag => {
			return service.countIntraclinicTagPost(tag.id)
			.then((count:number) => {
				return {
					tag: tag,
					count: count
				};
			})
		}));
		items = items.filter(item => item.count === 0 );
		if( items.length === 0 ){
			return h.div({}, ["削除できるタグがありません。"]);
		}
		let inputs = items.map(item => {
			return {
				tag: item.tag,
				input: h.input({type: "checkbox"}, [])
			}
		});
		let delButton = h.button({}, ["削除"]);
		delButton.addEventListener("click", event => {
			let selectedIds = inputs.filter(input => input.input.checked).map(input => input.tag.id);
			Promise.all(selectedIds.map(tagId => {
				return service.deleteIntraclinicTag(tagId);
			}))
			.then(_ => {
				if( this.callbacks.onDelTag ){
					this.callbacks.onDelTag(selectedIds);
				}
			})
		})
		let cancelButton = h.button({}, ["キャンセル"]);
		cancelButton.addEventListener("click", event => {
			this.workarea.innerHTML = "";
		})
		let form = h.form({}, [
			...inputs.map(input => {
				return h.div({}, [
					input.input,
					" ",
					input.tag.name
				])
			}),
			delButton, " ",
			cancelButton
		]);
		return form;
	}
}