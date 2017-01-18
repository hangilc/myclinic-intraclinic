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
const $ = require("jquery");
const service = require("./service");
const nav_1 = require("./nav");
const post_1 = require("./post");
const post_form_1 = require("./post-form");
const intraclinic_post_1 = require("./model/intraclinic-post");
const moment = require("moment");
$.ajax({
    url: "whoami",
    success: function (user) {
        if (user === null) {
            user = {};
        }
        start(user);
    }
});
function createNewIntraclinicPost() {
    let post = new intraclinic_post_1.IntraclinicPost();
    post.createdAt = moment().format("YYYY-MM-DD");
    post.content = "";
    post.id = 0;
    return post;
}
function userDisp(name) {
    return typed_dom_1.h.div({ "id": "newPostWrapper" }, [
        "ユーザー名：",
        name,
        " ",
        typed_dom_1.h.a({ href: "logout" }, ["ログアウト"])
    ]);
}
function editPart(isOwner, onEnter) {
    if (isOwner) {
        let startEdit = typed_dom_1.h.a({}, ["新規投稿"]);
        let editorWrapper = typed_dom_1.h.div({}, []);
        startEdit.addEventListener("click", event => {
            if (editorWrapper.firstChild !== null) {
                return;
            }
            let post = createNewIntraclinicPost();
            let form = new post_form_1.PostForm(post);
            form.onEnter = () => __awaiter(this, void 0, void 0, function* () {
                let id = yield service.enterIntraclinicPost(post.content, post.createdAt);
                editorWrapper.innerHTML = "";
                onEnter(id);
            });
            form.onCancel = () => {
                editorWrapper.innerHTML = "";
            };
            editorWrapper.appendChild(form.dom);
        });
        return typed_dom_1.h.div({}, [
            startEdit,
            editorWrapper
        ]);
    }
    else {
        return null;
    }
}
function start(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let role = user.role;
        let isOwner = false;
        if (role === "owner") {
            isOwner = true;
        }
        else if (role === "staff") {
            ; // nop
        }
        else {
            return;
        }
        let navManager = new nav_1.NavManager();
        yield adaptToNumberOfPostsChange();
        navManager.setOnPageChange(() => {
            updatePosts();
        });
        let postsWrapper = typed_dom_1.h.div({}, []);
        typed_dom_1.appendToElement(document.body, [
            typed_dom_1.h.h1({}, ["院内ミーティング"]),
            userDisp(user.label),
            editPart(isOwner, onEnter),
            navManager.createNav(),
            postsWrapper,
            navManager.createNav()
        ]);
        navManager.triggerPageChange();
        function onEnter(id) {
            return __awaiter(this, void 0, void 0, function* () {
                fullUpdate();
            });
        }
        function fullUpdate() {
            return __awaiter(this, void 0, void 0, function* () {
                yield adaptToNumberOfPostsChange();
                updatePosts();
            });
        }
        function adaptToNumberOfPostsChange() {
            return __awaiter(this, void 0, void 0, function* () {
                let nPosts = yield service.countIntraclinicPosts();
                navManager.updateTotalNumberOfPosts(nPosts);
            });
        }
        function updatePosts() {
            return __awaiter(this, void 0, void 0, function* () {
                let posts = yield service.listIntraclinicPosts(navManager.getCurrentOffset(), navManager.getPostsperPage());
                postsWrapper.innerHTML = "";
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i];
                    let postId = post.id;
                    let comments = yield service.listIntraclinicComments(postId);
                    let p = new post_1.Post(post, comments, isOwner, user.label);
                    p.onEdit = makeOnEditCallback(p, post, fullUpdate);
                    p.onDelete = makeOnDeleteCallback(postId, fullUpdate);
                    p.onEnterComment = makeOnEnterCommentCallback(updatePosts);
                    postsWrapper.appendChild(p.dom);
                }
                ;
            });
        }
    });
}
function makeOnEditCallback(post, postModel, updater) {
    return function () {
        return __awaiter(this, void 0, void 0, function* () {
            let form = new post_form_1.PostForm(postModel);
            form.onEnter = () => __awaiter(this, void 0, void 0, function* () {
                yield service.updateIntraclinicPost(postModel.id, postModel.content);
                updater();
            });
            form.onCancel = () => {
                typed_dom_1.removeElement(form.dom);
                post.dom.style.display = "";
            };
            post.dom.style.display = "none";
            let parent = post.dom.parentNode;
            if (parent !== null) {
                parent.insertBefore(form.dom, post.dom);
            }
        });
    };
}
function makeOnDeleteCallback(postId, updater) {
    return function () {
        return __awaiter(this, void 0, void 0, function* () {
            let comments = yield service.listIntraclinicComments(postId);
            if (comments.length > 0) {
                alert("コメントのある投稿は削除できません。");
                return;
            }
            if (!confirm("この投稿を削除していいですか？")) {
                return;
            }
            yield service.deleteIntraclinicPost(postId);
            updater();
        });
    };
}
function makeOnEnterCommentCallback(updater) {
    return function (comment) {
        return __awaiter(this, void 0, void 0, function* () {
            yield service.enterIntraclinicComment(comment.name, comment.content, comment.postId, comment.createdAt);
            updater();
        });
    };
}
