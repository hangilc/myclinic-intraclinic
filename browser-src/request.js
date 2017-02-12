"use strict";
const $ = require("jquery");
function arrayConverter(c) {
    return function (src) {
        return src.map(c);
    };
}
exports.arrayConverter = arrayConverter;
function request(url, data, method, cvtor) {
    if (method === "POST" && typeof data !== "string") {
        data = JSON.stringify(data);
    }
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            type: method,
            data: data,
            dataType: "json",
            contentType: "application/json",
            timeout: 15000,
            success: function (result) {
                try {
                    let obj = cvtor(result);
                    resolve(obj);
                }
                catch (ex) {
                    reject(ex);
                }
            },
            error: function (xhr, status, ex) {
                reject(JSON.stringify({ xhr: xhr, status: status, exception: ex }));
            }
        });
    });
}
exports.request = request;
