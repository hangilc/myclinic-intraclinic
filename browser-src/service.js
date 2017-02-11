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
const intraclinic_tag_1 = require("./model/intraclinic-tag");
function toNumber(src) {
    return +src;
}
function toText(src) {
    return "" + src;
}
function toBoolean(src) {
    return src === true;
}
let PostArrayConverter = request_1.arrayConverter(intraclinic_post_1.jsonToIntraclinicPost);
let CommentArrayConverter = request_1.arrayConverter(intraclinic_comment_1.jsonToIntraclinicComment);
let TagArrayConverter = request_1.arrayConverter(intraclinic_tag_1.jsonToIntraclinicTag);
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
function countIntraclinicOlderThan(date) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=count_intra_clinic_posts_older_than", { date: date }, "GET", toNumber);
    });
}
exports.countIntraclinicOlderThan = countIntraclinicOlderThan;
function countIntraclinicSearch(text) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=count_intra_clinic_search", { text: text }, "GET", toNumber);
    });
}
exports.countIntraclinicSearch = countIntraclinicSearch;
function searchIntraclinic(text, offset, n) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=search_intra_clinic", { text: text, offset: offset, n: n }, "GET", PostArrayConverter);
    });
}
exports.searchIntraclinic = searchIntraclinic;
function createIntraclinicTag(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=create_intra_clinic_tag", { name: name }, "POST", toNumber);
    });
}
exports.createIntraclinicTag = createIntraclinicTag;
function getIntraclinicTag(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=get_intra_clinic_tag", { id: id }, "GET", intraclinic_tag_1.jsonToIntraclinicTag);
    });
}
exports.getIntraclinicTag = getIntraclinicTag;
function listIntraclinicTag() {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=list_intra_clinic_tag", {}, "GET", TagArrayConverter);
    });
}
exports.listIntraclinicTag = listIntraclinicTag;
function renameIntraclinicTag(id, name) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=rename_intra_clinic_tag", { id: id, name: name }, "POST", toBoolean);
    });
}
exports.renameIntraclinicTag = renameIntraclinicTag;
function deleteIntraclinicTag(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=delete_intra_clinic_tag", { id: id }, "POST", toBoolean);
    });
}
exports.deleteIntraclinicTag = deleteIntraclinicTag;
function addIntraclinicPostToTag(tagId, postId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=add_intra_clinic_post_to_tag", { tag_id: tagId, post_id: postId }, "POST", toBoolean);
    });
}
exports.addIntraclinicPostToTag = addIntraclinicPostToTag;
function removeIntraclinicPostFromTag(tagId, postId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=remove_intra_clinic_post_from_tag", { tag_id: tagId, post_id: postId }, "POST", toBoolean);
    });
}
exports.removeIntraclinicPostFromTag = removeIntraclinicPostFromTag;
function countIntraclinicTagPost(tagId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=count_intra_clinic_tag_post", { tag_id: tagId }, "GET", toNumber);
    });
}
exports.countIntraclinicTagPost = countIntraclinicTagPost;
function listIntraclinicTagPost(tagId, offset, n) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_1.request("/service?_q=list_intra_clinic_tag_post", { tag_id: tagId, offset: offset, n: n }, "GET", PostArrayConverter);
    });
}
exports.listIntraclinicTagPost = listIntraclinicTagPost;
