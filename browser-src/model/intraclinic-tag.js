"use strict";
class IntraclinicTag {
}
exports.IntraclinicTag = IntraclinicTag;
function jsonToIntraclinicTag(src) {
    let tag = new IntraclinicTag();
    tag.id = src.id;
    tag.name = src.name;
    return tag;
}
exports.jsonToIntraclinicTag = jsonToIntraclinicTag;
