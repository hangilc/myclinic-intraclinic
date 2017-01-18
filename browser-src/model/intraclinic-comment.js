"use strict";
class IntraclinicComment {
}
exports.IntraclinicComment = IntraclinicComment;
function jsonToIntraclinicComment(src) {
    let com = new IntraclinicComment();
    com.id = src.id;
    com.name = src.name;
    com.content = src.content;
    com.postId = src.post_id;
    com.createdAt = src.created_at;
    return com;
}
exports.jsonToIntraclinicComment = jsonToIntraclinicComment;
