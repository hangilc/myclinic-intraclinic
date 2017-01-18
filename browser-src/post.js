"use strict";
const typed_dom_1 = require("./typed-dom");
const kanjidate = require("kanjidate");
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
function commentPart(comments) {
    return typed_dom_1.h.table({
        "width": "100%",
        "class": "commentListWrapper"
    }, [
        typed_dom_1.h.tbody({}, [
            typed_dom_1.h.tr({ "valign": "top" }, [
                typed_dom_1.h.td({ "width": "50%" }, comments.map(c => {
                    return typed_dom_1.h.div({}, [
                        c.name, " ", c.content
                    ]);
                })),
                typed_dom_1.h.td({ "width": "50%" }, [
                    typed_dom_1.h.div({}, [
                        "コメント追加",
                        " ",
                        typed_dom_1.h.input({ "value": "閲覧しました。" }, []),
                        " ",
                        typed_dom_1.h.button({}, ["入力"])
                    ])
                ])
            ])
        ])
    ]);
}
class Post {
    constructor(modelPost, modelComments, isOwner) {
        let editPart = null;
        if (isOwner) {
            editPart = typed_dom_1.h.div({
                style: "border:1px solid #ccc; padding: 6px"
            }, [
                typed_dom_1.h.a({ "class": "cmd-link" }, ["編集"]),
                " ",
                typed_dom_1.h.a({ "class": "cmd-link" }, ["削除"]),
            ]);
        }
        let content = typed_dom_1.h.div({ "class": "content" }, formatContent(modelPost.content));
        let comment = null;
        if (!isOwner) {
            comment = commentPart(modelComments);
        }
        this.dom = typed_dom_1.h.div({ "class": "postWrapper" }, [
            typed_dom_1.h.div({ "class": "dateLabel" }, [
                kanjidate.format(kanjidate.f1, modelPost.createdAt)
            ]),
            editPart,
            content,
            comment
        ]);
    }
}
exports.Post = Post;
