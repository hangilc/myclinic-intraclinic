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
        return typed_dom_1.h.div({}, [
            newTag, " ",
        ]);
    }
    newTagForm() {
        let input = typed_dom_1.h.input({ size: 8 }, []);
        let button = typed_dom_1.h.button({}, ["入力"]);
        button.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            let text = input.value.trim();
            if (text === "") {
                return;
            }
            let newTagId = yield service.createIntraclinicTag(text);
            if (this.callbacks.onNewTag) {
                this.callbacks.onNewTag(newTagId);
            }
        }));
        return typed_dom_1.h.form({}, [
            "タグ名：",
            input,
            " ",
            button
        ]);
    }
}
exports.TagForm = TagForm;
