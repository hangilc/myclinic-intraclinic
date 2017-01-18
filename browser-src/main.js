"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const $ = require("jquery");
const service = require("./service");
const nav_1 = require("./nav");
const post_1 = require("./post");
$.ajax({
    url: "whoami",
    success: function (user) {
        if (user === null) {
            user = {};
        }
        start(user);
    }
});
function setUserName(name) {
    let e = document.getElementById("user-name");
    if (e !== null) {
        e.innerHTML = "";
        let txt = document.createTextNode(name);
        e.appendChild(txt);
    }
}
function start(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let role = user.role;
        let isOwner = false;
        if (role === "owner") {
            $("#newPostWrapper").css("display", "");
            isOwner = true;
        }
        else if (role === "staff") {
        }
        else {
            return;
        }
        setUserName(user.label);
        let navManager = new nav_1.NavManager();
        navManager.setOnPageChange(() => {
            updatePosts();
        });
        let nPosts = yield service.countIntraclinicPosts();
        navManager.updateTotalNumberOfPosts(nPosts);
        setupNavs();
        navManager.triggerPageChange();
        function setupNavs() {
            let els = document.querySelectorAll(".nav");
            for (let i = 0; i < els.length; i++) {
                let e = els[i];
                e.appendChild(navManager.createNav());
            }
        }
        function updatePosts() {
            return __awaiter(this, void 0, void 0, function* () {
                let posts = yield service.listIntraclinicPosts(navManager.getCurrentOffset(), navManager.getPostsperPage());
                let wrapper = document.getElementById("postListWrapper");
                if (wrapper !== null) {
                    let realWrapper = wrapper;
                    realWrapper.innerHTML = "";
                    posts.forEach((post) => __awaiter(this, void 0, void 0, function* () {
                        let comments = yield service.listIntraclinicComment(post.id);
                        let p = new post_1.Post(post, comments, isOwner);
                        realWrapper.appendChild(p.dom);
                    }));
                }
            });
        }
    });
}
