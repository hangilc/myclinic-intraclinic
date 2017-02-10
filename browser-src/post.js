"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const typed_dom_1 = require("./typed-dom");
const intraclinic_comment_1 = require("./model/intraclinic-comment");
const kanjidate = require("kanjidate");
const moment = require("moment");
function formatContent(content) {
    let lines = content.split(/\r\n|\n|r/);
    let out = [];
    for (let i = 0; i < lines.length; i++) {
        if (i !== 0) {
            out.push(typed_dom_1.h.br({}, []));
        }
        out.push(lines[i]);
    }
    return out;
}
class Post {
    constructor(modelPost, modelComments, isOwner, userName) {
        this.onEdit = () => { };
        this.onDelete = () => { };
        this.onEnterComment = _ => { };
        this.modelPost = modelPost;
        this.modelComments = modelComments;
        this.isOwner = isOwner;
        this.userName = userName;
        this.commentsWrapper = typed_dom_1.h.div({}, [this.commentPart()]);
        this.dom = typed_dom_1.h.div({ "class": "postWrapper" }, [
            this.datePart(),
            this.editPart(),
            this.contentPart(),
            this.commentsWrapper
        ]);
    }
    updateCommentsArea(comments) {
        return __awaiter(this, void 0, void 0, function* () {
            this.modelComments = comments;
            this.commentsWrapper.innerHTML = "";
            typed_dom_1.appendToElement(this.commentsWrapper, [this.commentPart()]);
        });
    }
    datePart() {
        return typed_dom_1.h.div({ "class": "dateLabel" }, [
            kanjidate.format(kanjidate.f1, this.modelPost.createdAt)
        ]);
    }
    editPart() {
        if (this.isOwner) {
            let editLink = typed_dom_1.h.a({ "class": "cmd-link" }, ["編集"]);
            editLink.addEventListener("click", event => { this.onEdit(); });
            let deleteLink = typed_dom_1.h.a({ "class": "cmd-link" }, ["削除"]);
            deleteLink.addEventListener("click", event => { this.onDelete(); });
            return typed_dom_1.h.div({
                style: "border:1px solid #ccc; padding: 6px"
            }, [
                editLink,
                " ",
                deleteLink,
            ]);
        }
        else {
            return null;
        }
    }
    contentPart() {
        return typed_dom_1.h.div({ "class": "content" }, formatContent(this.modelPost.content));
    }
    commentPart() {
        return typed_dom_1.h.table({
            "width": "100%",
            "class": "commentListWrapper"
        }, [
            typed_dom_1.h.tbody({}, [
                typed_dom_1.h.tr({ "valign": "top" }, [
                    typed_dom_1.h.td({ "width": "50%" }, this.modelComments.map(c => {
                        return typed_dom_1.h.div({}, [
                            c.name, " ", c.content
                        ]);
                    })),
                    typed_dom_1.h.td({ "width": "50%" }, [
                        this.commentFormPart()
                    ])
                ])
            ])
        ]);
    }
    commentFormPart() {
        let input = typed_dom_1.h.input({ "value": this.defaultInputValue() }, []);
        let enterButton = typed_dom_1.h.button({}, ["入力"]);
        enterButton.addEventListener("click", event => {
            let c = new intraclinic_comment_1.IntraclinicComment();
            c.name = this.userName;
            c.content = input.value.trim();
            c.postId = this.modelPost.id;
            c.createdAt = moment().format("YYYY-MM-DD");
            if (c.content === "") {
                alert("コメントの内容が入力されていません。");
                return;
            }
            this.onEnterComment(c);
        });
        return typed_dom_1.h.div({}, [
            "コメント追加",
            " ",
            input,
            " ",
            enterButton
        ]);
    }
    defaultInputValue() {
        if (this.isOwner) {
            return "";
        }
        else {
            let value = "";
            let hasSeen = false;
            let comments = this.modelComments;
            let userName = this.userName;
            for (let i = 0; i < comments.length; i++) {
                let c = comments[i];
                if (c.name === userName && c.content === "閲覧しました。") {
                    hasSeen = true;
                    break;
                }
            }
            return hasSeen ? "" : "閲覧しました。";
        }
    }
}
exports.Post = Post;
