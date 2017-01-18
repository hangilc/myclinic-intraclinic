"use strict";
const typed_dom_1 = require("./typed-dom");
const kanjidate = require("kanjidate");
class PostForm {
    constructor(post) {
        this.onEnter = () => { };
        this.onCancel = () => { };
        let content = typed_dom_1.h.textarea({ "rows": "16", "cols": "40" }, []);
        let enter = typed_dom_1.h.button({}, ["入力"]);
        enter.addEventListener("click", event => {
            post.content = content.value;
            this.onEnter();
        });
        let cancel = typed_dom_1.h.button({}, ["キャンセル"]);
        cancel.addEventListener("click", event => {
            this.onCancel();
        });
        this.dom = typed_dom_1.h.form({}, [
            typed_dom_1.h.div({}, [kanjidate.format(kanjidate.f1, post.createdAt)]),
            content,
            typed_dom_1.h.div({}, [
                enter,
                " ",
                cancel
            ])
        ]);
    }
}
exports.PostForm = PostForm;
