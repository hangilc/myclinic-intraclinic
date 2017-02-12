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
const service = require("./service");
class TagForm {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.workarea = typed_dom_1.h.div({}, []);
        this.dom = typed_dom_1.h.div({}, [
            this.createMenu(),
            this.workarea
        ]);
    }
    createMenu() {
        let newTag = typed_dom_1.h.a({}, ["新規タグ"]);
        newTag.addEventListener("click", event => {
            this.workarea.innerHTML = "";
            typed_dom_1.appendToElement(this.workarea, [
                this.newTagForm()
            ]);
        });
        let delTag = typed_dom_1.h.a({}, ["タグ削除"]);
        delTag.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            this.workarea.innerHTML = "";
            let form = yield this.delTagForm();
            typed_dom_1.appendToElement(this.workarea, [form]);
        }));
        let renameTag = typed_dom_1.h.a({}, ["タグ名変更"]);
        renameTag.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            this.workarea.innerHTML = "";
            let form = yield this.renameTagForm();
            typed_dom_1.appendToElement(this.workarea, [form]);
        }));
        return typed_dom_1.h.div({}, [
            newTag, " | ",
            delTag, " | ",
            renameTag
        ]);
    }
    newTagForm() {
        let input = typed_dom_1.h.input({ size: 12 }, []);
        let enterButton = typed_dom_1.h.button({}, ["入力"]);
        enterButton.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            let text = input.value.trim();
            if (text === "") {
                return;
            }
            let newTagId = yield service.createIntraclinicTag(text);
            if (this.callbacks.reloadPage) {
                this.callbacks.reloadPage();
            }
        }));
        let cancelButton = typed_dom_1.h.button({}, ["キャンセル"]);
        cancelButton.addEventListener("click", event => {
            this.workarea.innerHTML = "";
        });
        return typed_dom_1.h.form({}, [
            "タグ名：", input, " ",
            enterButton, " ",
            cancelButton
        ]);
    }
    delTagForm() {
        return __awaiter(this, void 0, void 0, function* () {
            let tags = yield service.listIntraclinicTag();
            let items = yield Promise.all(tags.map(tag => {
                return service.countIntraclinicTagPost(tag.id)
                    .then((count) => {
                    return {
                        tag: tag,
                        count: count
                    };
                });
            }));
            items = items.filter(item => item.count === 0);
            if (items.length === 0) {
                let okButton = typed_dom_1.h.button({}, ["OK"]);
                okButton.addEventListener("click", event => {
                    this.workarea.innerHTML = "";
                });
                return typed_dom_1.h.div({}, ["削除できるタグがありません。", " ", okButton]);
            }
            let inputs = items.map(item => {
                return {
                    tag: item.tag,
                    input: typed_dom_1.h.input({ type: "checkbox" }, [])
                };
            });
            let delButton = typed_dom_1.h.button({}, ["削除"]);
            delButton.addEventListener("click", event => {
                let selectedIds = inputs.filter(input => input.input.checked).map(input => input.tag.id);
                Promise.all(selectedIds.map(tagId => {
                    return service.deleteIntraclinicTag(tagId);
                }))
                    .then(_ => {
                    if (this.callbacks.reloadPage) {
                        this.callbacks.reloadPage();
                    }
                });
            });
            let cancelButton = typed_dom_1.h.button({}, ["キャンセル"]);
            cancelButton.addEventListener("click", event => {
                this.workarea.innerHTML = "";
            });
            let form = typed_dom_1.h.form({}, [
                ...inputs.map(input => {
                    return typed_dom_1.h.div({}, [
                        input.input,
                        " ",
                        input.tag.name
                    ]);
                }),
                delButton, " ",
                cancelButton
            ]);
            return form;
        });
    }
    renameTagForm() {
        return __awaiter(this, void 0, void 0, function* () {
            let allTags = yield service.listIntraclinicTag();
            let doneButton = typed_dom_1.h.button({}, ["終了"]);
            doneButton.addEventListener("click", event => {
                this.workarea.innerHTML = "";
            });
            let inputs = allTags.map(tag => {
                let button = typed_dom_1.h.button({}, ["名前変更"]);
                button.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
                    let newName = prompt("新しい名前", tag.name);
                    if (newName !== null) {
                        yield service.renameIntraclinicTag(tag.id, newName);
                        if (this.callbacks.reloadPage) {
                            this.callbacks.reloadPage();
                        }
                    }
                }));
                return typed_dom_1.h.div({}, [
                    tag.name, " ", button
                ]);
            });
            return typed_dom_1.h.div({}, [
                ...inputs,
                " ",
                doneButton
            ]);
        });
    }
}
exports.TagForm = TagForm;
