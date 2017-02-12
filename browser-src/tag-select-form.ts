import { h } from "./typed-dom";
import { IntraclinicTag } from "./model/intraclinic-tag";
import { batchModifyIntraclinicTagsForPost, BatchModifyIntraclinicTagsForPostArg,
	BatchModifyIntraclinicTagsForPostCommand } from "./service";

export class TagSelectForm {
	dom: HTMLElement;

	constructor(allTags: IntraclinicTag[], currentTags: IntraclinicTag[], postId: number,
		doneCallback: (boolean) => void){
		let checks = allTags.map(tag => {
			let checked: boolean = currentTags.some(t => t.id === tag.id);
			return {
				input: h.input({type: "checkbox", checked: checked}, []),
				label: tag.name,
				tag: tag
			}
		});
		let enterButton = h.button({}, ["入力"]);
		enterButton.addEventListener("click", async event => {
			let selected: IntraclinicTag[] = checks.filter(chk => chk.input.checked).map(chk => chk.tag);
			let toBeAdded = selected.filter(sel => currentTags.every(t => t.id !== sel.id));
			let toBeDeleted = currentTags.filter(t => selected.every(sel => sel.id !== t.id));
			let commands: BatchModifyIntraclinicTagsForPostCommand[] = [];
			toBeAdded.forEach(tag => {
				commands.push({ action: "add", tag_id: tag.id });
			})
			toBeDeleted.forEach(tag => {
				commands.push({ action: "remove", tag_id: tag.id });
			})
			let arg: BatchModifyIntraclinicTagsForPostArg = {
				post_id: postId,
				commands: commands
			}
			let ok = await batchModifyIntraclinicTagsForPost(arg);
			if( !ok ){
				alert("タグの編集に失敗しました");
				doneCallback(false);
				return;
			}
			doneCallback(true);
		});
		this.dom = h.div({
			style: "border:1px solid #ccc; padding: 6px"
		}, [
			...checks.map(chk => h.div({}, [chk.input, " ", chk.label])),
			h.div({}, [enterButton])
		]);
	}
}