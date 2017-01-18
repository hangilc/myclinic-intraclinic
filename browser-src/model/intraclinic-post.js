"use strict";
class IntraclinicPost {
}
exports.IntraclinicPost = IntraclinicPost;
function jsonToIntraclinicPost(src) {
    let post = new IntraclinicPost();
    post.id = src.id;
    post.content = src.content;
    post.createdAt = src.created_at;
    return post;
}
exports.jsonToIntraclinicPost = jsonToIntraclinicPost;
