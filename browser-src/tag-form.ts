import { h, appendToElement } from "./typed-dom";
import { IntraclinicTag } from "./model/intraclinic-tag";
import * as service from "./service";

interface TagFormCallbacks {
	//onNewTag?: (tagId: number) => Promise<void>;
	//onDelTag?: (tagIds: number[]) => Promise<void>;
	reloadPage?: () => Promise<void>;
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
		});
		let renameTag = h.a({}, ["タグ名変更"]);
		renameTag.addEventListener("click", async event => {
			this.workarea.innerHTML = "";
			let form = await this.renameTagForm();
			appendToElement(this.workarea, [form]);
		})
		return h.div({}, [
			newTag, " | ",
			delTag, " | ",
			renameTag
		])
	}

	private newTagForm(): HTMLElement {
		let input = h.input({size: 12}, []);
		let enterButton = h.button({}, ["入力"]);
		enterButton.addEventListener("click", async event => {
			let text = input.value.trim();
			if( text === "" ){
				return;
			}
			let newTagId = await service.createIntraclinicTag(text);
			if( this.callbacks.reloadPage ){
				this.callbacks.reloadPage();
			}
		});
		let cancelButton = h.button({}, ["キャンセル"]);
		cancelButton.addEventListener("click", event => {
			this.workarea.innerHTML = "";
		})
		return h.form({}, [
			"タグ名：", input, " ",
			enterButton, " ",
			cancelButton
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
			let okButton = h.button({}, ["OK"]);
			okButton.addEventListener("click", event => {
				this.workarea.innerHTML = "";
			})
			return h.div({}, ["削除できるタグがありません。", " ", okButton]);
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
				if( this.callbacks.reloadPage ){
					this.callbacks.reloadPage();
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

	private async renameTagForm(): Promise<HTMLElement> {
		let allTags = await service.listIntraclinicTag();
		let doneButton = h.button({}, ["終了"]);
		doneButton.addEventListener("click", event => {
			this.workarea.innerHTML = "";
		});
		let inputs = allTags.map(tag => {
			let button = h.button({}, ["名前変更"]);
			button.addEventListener("click", async event => {
				let newName = prompt("新しい名前", tag.name);
				if( newName !== null ){
					await service.renameIntraclinicTag(tag.id, newName);
					if( this.callbacks.reloadPage ){
						this.callbacks.reloadPage();
					}
				}
			})
			return h.div({}, [
				tag.name, " ", button
			]);
		})
		return h.div({}, [
			...inputs,
			" ",
			doneButton
		]);
	}
}