"use strict";
const $ = require("jquery");
$.ajax({
    url: "whoami",
    success: function (user) {
        if (user === null) {
            user = {};
        }
        start(user);
    }
});
function start(user) {
    let role = user.role;
    if (role === "owner") {
        $("#newPostWrapper").css("display", "");
    }
}
