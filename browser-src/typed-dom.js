"use strict";
function createElement(tag, attrs, children) {
    let e = document.createElement(tag);
    for (let key in attrs) {
        let val = attrs[key];
        if (key === "style") {
            if (typeof val === "string") {
                e.style.cssText = val;
            }
            else {
                for (let cssKey in val) {
                    e.style[cssKey] = val[cssKey];
                }
            }
        }
        else {
            e.setAttribute(key, val);
        }
    }
    children.forEach(function (n) {
        if (typeof n === "string") {
            e.appendChild(document.createTextNode(n));
        }
        else if (n instanceof HTMLElement) {
            e.appendChild(n);
        }
    });
    return e;
}
exports.createElement = createElement;
function createElementFn(fn, tag, attrs, children) {
    let e = createElement(tag, attrs, children);
    fn(e);
    return e;
}
exports.createElementFn = createElementFn;
var h;
(function (h) {
    function makeCreator(tag) {
        return function (attrs, children) {
            return createElement(tag, attrs, children);
        };
    }
    h.div = makeCreator("div");
    h.h1 = makeCreator("h1");
    h.h2 = makeCreator("h2");
    h.h3 = makeCreator("h3");
    h.input = makeCreator("input");
    h.button = makeCreator("button");
    h.table = makeCreator("table");
    h.tbody = makeCreator("tbody");
    h.tr = makeCreator("tr");
    h.td = makeCreator("td");
    h.br = makeCreator("br");
    h.p = makeCreator("p");
    h.select = makeCreator("select");
    h.option = makeCreator("option");
    h.span = makeCreator("span");
    function form(attrs, children) {
        if (!("onSubmit" in attrs)) {
            attrs.onSubmit = "return false";
        }
        return createElement("form", attrs, children);
    }
    h.form = form;
    function a(attrs, children) {
        if (!("href" in attrs)) {
            attrs.href = "javascript:void(0)";
        }
        else if (attrs.href === undefined) {
            delete attrs.href;
        }
        return createElement("a", attrs, children);
    }
    h.a = a;
})(h = exports.h || (exports.h = {}));
