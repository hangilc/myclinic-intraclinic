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
const nav_1 = require("./nav");
const intraclinic_post_1 = require("./model/intraclinic-post");
const service = require("./service");
const post_1 = require("./post");
const post_form_1 = require("./post-form");
const moment = require("moment");
class User {
    constructor(name, role, label) {
        this.name = name;
        this.role = role;
        this.label = label;
    }
    isOwner() {
        return this.role === "owner";
    }
    isStaff() {
        return this.role === "staff";
    }
}
$.ajax({
    url: "whoami",
    success: function (user) {
        if (user === null) {
            user = {};
        }
        let main = new Main(new User(user.name, user.role, user.label));
        document.body.appendChild(main.dom);
        main.setup();
    }
});
class PostWithComments {
    constructor(post, comments) {
        this.post = post;
        this.comments = comments;
    }
}
class Main {
    constructor(user) {
        this.user = user;
        if (!(user.isOwner() || user.isStaff())) {
            this.dom = typed_dom_1.h.div({}, ["Login required."]);
            return;
        }
        this.nav = new nav_1.Nav(posts => { this.onPageChange(posts); });
        this.postsWrapper = typed_dom_1.h.div({}, []);
        this.dom = typed_dom_1.h.div({}, [
            typed_dom_1.h.h1({}, ["院内ミーティング"]),
            this.userDisp(),
            this.editPart(),
            this.nav.navChoiceDom,
            this.nav.navWorkarea,
            this.nav.createDom(),
            this.postsWrapper,
            this.nav.createDom()
        ]);
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.nav.update();
            this.nav.triggerPageChange();
        });
    }
    userDisp() {
        return typed_dom_1.h.div({ "id": "newPostWrapper" }, [
            "ユーザー名：",
            this.user.name,
            " ",
            typed_dom_1.h.a({ href: "logout" }, ["ログアウト"])
        ]);
    }
    editPart() {
        if (this.user.isOwner()) {
            let startEdit = typed_dom_1.h.a({}, ["新規投稿"]);
            let editorWrapper = typed_dom_1.h.div({}, []);
            startEdit.addEventListener("click", event => {
                if (editorWrapper.firstChild !== null) {
                    return;
                }
                let post = this.createNewIntraclinicPost();
                let form = new post_form_1.PostForm(post);
                form.onEnter = () => __awaiter(this, void 0, void 0, function* () {
                    yield service.enterIntraclinicPost(post.content, post.createdAt);
                    editorWrapper.innerHTML = "";
                    yield this.nav.update();
                    this.nav.triggerPageChange();
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
    createNewIntraclinicPost() {
        let post = new intraclinic_post_1.IntraclinicPost();
        post.createdAt = moment().format("YYYY-MM-DD");
        post.content = "";
        post.id = 0;
        return post;
    }
    onPageChange(posts) {
        this.postsWrapper.innerHTML = "";
        Promise.all(posts.map((post) => __awaiter(this, void 0, void 0, function* () {
            let comments = yield service.listIntraclinicComments(post.id);
            return new PostWithComments(post, comments);
        })))
            .then((posts) => {
            this.renderPosts(posts);
        })
            .catch(err => {
            console.log(err);
        });
    }
    renderPosts(posts) {
        let wrapper = this.postsWrapper;
        posts.forEach(post => {
            let p = new post_1.Post(post.post, post.comments, this.user.isOwner(), this.user.label);
            p.onEdit = this.makeOnEditCallback(p, post.post);
            p.onDelete = this.makeOnDeleteCallback(post.post.id);
            p.onEnterComment = this.makeOnEnterCommentCallback(p);
            wrapper.appendChild(p.dom);
        });
    }
    makeOnEditCallback(post, postModel) {
        return () => __awaiter(this, void 0, void 0, function* () {
            let form = new post_form_1.PostForm(postModel);
            form.onEnter = () => __awaiter(this, void 0, void 0, function* () {
                yield service.updateIntraclinicPost(postModel.id, postModel.content);
                this.nav.triggerPageChange();
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
    }
    makeOnDeleteCallback(postId) {
        return () => __awaiter(this, void 0, void 0, function* () {
            let comments = yield service.listIntraclinicComments(postId);
            if (comments.length > 0) {
                alert("コメントのある投稿は削除できません。");
                return;
            }
            if (!confirm("この投稿を削除していいですか？")) {
                return;
            }
            yield service.deleteIntraclinicPost(postId);
            yield this.nav.update();
            this.nav.triggerPageChange();
        });
    }
    makeOnEnterCommentCallback(post) {
        return (comment) => __awaiter(this, void 0, void 0, function* () {
            yield service.enterIntraclinicComment(comment.name, comment.content, comment.postId, comment.createdAt);
            let comments = yield service.listIntraclinicComments(comment.postId);
            post.updateCommentsArea(comments);
        });
    }
}
