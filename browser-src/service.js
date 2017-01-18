"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request_1 = require("./request");
const intraclinic_post_1 = require("./model/intraclinic-post");
const intraclinic_comment_1 = require("./model/intraclinic-comment");
function toNumber(src) {
    return +src;
}
function toText(src) {
    return "" + src;
}
let PostArrayConverter = request_1.arrayConverter(intraclinic_post_1.jsonToIntraclinicPost);
let CommentArrayConverter = request_1.arrayConverter(intraclinic_comment_1.jsonToIntraclinicComment);
function countIntraclinicPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service", { _q: "count_intra_clinic_posts" }, "GET", toNumber);
    });
}
exports.countIntraclinicPosts = countIntraclinicPosts;
function listIntraclinicPosts(offset, n) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=list_intra_clinic_posts", {
            offset: offset,
            n: n
        }, "GET", PostArrayConverter);
    });
}
exports.listIntraclinicPosts = listIntraclinicPosts;
function getIntraclinicPost(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=get_intra_clinic_post", {
            id: id
        }, "GET", intraclinic_post_1.jsonToIntraclinicPost);
    });
}
exports.getIntraclinicPost = getIntraclinicPost;
function listIntraclinicComments(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=list_intra_clinic_comments", {
            post_id: postId
        }, "GET", CommentArrayConverter);
    });
}
exports.listIntraclinicComments = listIntraclinicComments;
function enterIntraclinicPost(content, createdAt) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=enter_intra_clinic_post", {
            content: content,
            created_at: createdAt
        }, "POST", toNumber);
    });
}
exports.enterIntraclinicPost = enterIntraclinicPost;
function updateIntraclinicPost(id, content) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=update_intra_clinic_post", {
            id: id,
            content: content
        }, "POST", toString);
    });
}
exports.updateIntraclinicPost = updateIntraclinicPost;
function deleteIntraclinicPost(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=delete_intra_clinic_post", {
            id: id
        }, "POST", toString);
    });
}
exports.deleteIntraclinicPost = deleteIntraclinicPost;
function enterIntraclinicComment(name, content, postId, createdAt) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=enter_intra_clinic_comment", {
            name: name,
            content: content,
            post_id: postId,
            created_at: createdAt
        }, "POST", toNumber);
    });
}
exports.enterIntraclinicComment = enterIntraclinicComment;
