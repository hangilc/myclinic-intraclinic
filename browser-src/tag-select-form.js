"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const typed_dom_1 = require("./typed-dom");
const service_1 = require("./service");
class TagSelectForm {
    constructor(allTags, currentTags, postId) {
        let checks = allTags.map(tag => {
            let checked = currentTags.some(t => t.id === tag.id);
            return {
                input: typed_dom_1.h.input({ type: "checkbox", checked: checked }, []),
                label: tag.name,
                tag: tag
            };
        });
        let enterButton = typed_dom_1.h.button({}, ["入力"]);
        enterButton.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            let selected = checks.filter(chk => chk.input.checked).map(chk => chk.tag);
            let toBeAdded = selected.filter(sel => currentTags.every(t => t.id !== sel.id));
            let toBeDeleted = currentTags.filter(t => selected.every(sel => sel.id !== t.id));
            let commands = [];
            toBeAdded.forEach(tag => {
                commands.push({ action: "add", tag_id: tag.id });
            });
            toBeDeleted.forEach(tag => {
                commands.push({ action: "remove", tag_id: tag.id });
            });
            let arg = {
                post_id: postId,
                commands: commands
            };
            let ok = yield service_1.batchModifyIntraclinicTagsForPost(arg);
            if (!ok) {
                alert("タグの編集に失敗しました");
                return;
            }
            console.log("ok");
        }));
        this.dom = typed_dom_1.h.div({
            style: "border:1px solid #ccc; padding: 6px"
        }, [
            ...checks.map(chk => typed_dom_1.h.div({}, [chk.input, " ", chk.label])),
            typed_dom_1.h.div({}, [enterButton])
        ]);
    }
}
exports.TagSelectForm = TagSelectForm;
