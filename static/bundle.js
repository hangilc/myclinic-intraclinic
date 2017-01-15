/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const typed_dom_1 = __webpack_require__(2);
	const myclinic_modal_1 = __webpack_require__(1);
	let arg = new myclinic_modal_1.OpenModalArg()
	    .setTitle("ログイン")
	    .setInit((content, close) => {
	    content.appendChild(typed_dom_1.h.div({}, [
	        "CONTENT"
	    ]));
	});
	myclinic_modal_1.openModal(arg);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const typed_dom_1 = __webpack_require__(2);
	class ModalDialog {
	    constructor(title = "Untitled") {
	        this.screenZIndex = 10;
	        this.screenOpacity = 0.5;
	        this.dialogZIndex = 11;
	        this.onClose = () => true;
	        this.screen = null;
	        this.dialog = null;
	        this.content = null;
	        this.handle = null;
	        this.titleLabel = title;
	        this.screen = this.createScreen();
	        this.dialog = this.createDialog();
	        if (this.dialog !== null) {
	            if (this.handle !== null) {
	                this.bindHandle(this.handle, this.dialog);
	            }
	        }
	    }
	    setOnClose(fn) {
	        this.onClose = fn;
	    }
	    open() {
	        document.body.appendChild(this.screen);
	        document.body.appendChild(this.dialog);
	    }
	    close() {
	        if (this.screen) {
	            if (this.screen.parentNode !== null) {
	                this.screen.parentNode.removeChild(this.screen);
	            }
	        }
	        if (this.dialog) {
	            if (this.dialog.parentNode !== null) {
	                this.dialog.parentNode.removeChild(this.dialog);
	            }
	        }
	    }
	    getContent() {
	        return this.content;
	    }
	    reposition() {
	        let dialog = this.dialog;
	        if (dialog !== null) {
	            let space = window.innerWidth - dialog.offsetWidth;
	            if (space > 0) {
	                dialog.style.left = Math.floor(space / 2) + "px";
	            }
	        }
	    }
	    createScreen() {
	        return typed_dom_1.h.div({
	            style: {
	                position: "fixed",
	                backgroundColor: "#999",
	                width: "100%",
	                height: "100%",
	                left: 0,
	                top: 0,
	                opacity: this.screenOpacity,
	                filter: "alpha(opacity=" + Math.round(this.screenOpacity * 100) + ")",
	                zIndex: this.screenZIndex,
	            }
	        }, []);
	    }
	    createDialog() {
	        return typed_dom_1.h.div({
	            style: {
	                position: "absolute",
	                left: "100px",
	                top: "50px",
	                padding: "10px",
	                border: "2px solid gray",
	                backgroundColor: "white",
	                opacity: 1.0,
	                filter: "alpha(opacity=100)",
	                zIndex: this.dialogZIndex,
	                overflow: "auto"
	            }
	        }, [
	            this.createHeader(),
	            this.createContent()
	        ]);
	    }
	    createHeader() {
	        let header = typed_dom_1.h.table({
	            width: "100%",
	            cellpadding: "0",
	            cellspacing: "0",
	            style: {
	                margin: 0,
	                padding: 0
	            }
	        }, [
	            typed_dom_1.h.tbody({}, [
	                typed_dom_1.h.tr({}, [
	                    typed_dom_1.h.td({
	                        width: "*",
	                        style: {
	                            "user-select": "none",
	                            "-moz-user-select": "none"
	                        }
	                    }, [this.createTitle()]),
	                    typed_dom_1.h.td({
	                        width: "auto",
	                        style: {
	                            width: "16px",
	                            verticalAlign: "middle"
	                        }
	                    }, [this.createCloseBox()])
	                ])
	            ])
	        ]);
	        this.handle = header;
	        return header;
	    }
	    createTitle() {
	        return typed_dom_1.h.div({}, [
	            typed_dom_1.h.div({
	                style: {
	                    cursor: "move",
	                    backgroundColor: "#ccc",
	                    fontWeight: "bold",
	                    padding: "6px 4px 4px 4px"
	                }
	            }, [this.titleLabel])
	        ]);
	    }
	    createCloseBox() {
	        let anchor = typed_dom_1.h.a({
	            style: {
	                fontSize: "13px",
	                fontWeight: "bold",
	                margin: "4px 0 4px 4px",
	                padding: 0,
	                textDecoration: "none",
	                color: "#333"
	            }
	        }, ["×"]);
	        anchor.addEventListener("click", event => {
	            let executeClose = this.onClose();
	            if (executeClose !== false) {
	                this.close();
	            }
	        });
	        return anchor;
	    }
	    createContent() {
	        this.content = typed_dom_1.h.div({
	            style: {
	                "margin-top": "10px"
	            }
	        }, []);
	        return this.content;
	    }
	    bindHandle(handle, dialog) {
	        handle.addEventListener("mousedown", event => {
	            event.preventDefault();
	            event.stopPropagation();
	            let startX = event.pageX;
	            let startY = event.pageY;
	            let offsetX = dialog.offsetLeft;
	            let offsetY = dialog.offsetTop;
	            document.addEventListener("mousemove", mouseMoveHandler);
	            document.addEventListener("mouseup", event => {
	                document.removeEventListener("mousemove", mouseMoveHandler);
	            });
	            function mouseMoveHandler(event) {
	                var windowWidth = window.innerWidth;
	                var windowHeight = window.innerHeight;
	                var dialogWidth = dialog.offsetWidth;
	                var dialogHeight = dialog.offsetHeight;
	                var currX = event.pageX;
	                var currY = event.pageY;
	                var newLeft = offsetX + (currX - startX);
	                if (newLeft + dialogWidth > windowWidth) {
	                    newLeft = windowWidth - dialogWidth;
	                }
	                if (newLeft < 0) {
	                    newLeft = 0;
	                }
	                var newTop = offsetY + (currY - startY);
	                if (newTop + dialogHeight > windowHeight) {
	                    newTop = windowHeight - dialogHeight;
	                }
	                if (newTop < 0) {
	                    newTop = 0;
	                }
	                dialog.style.left = newLeft + "px";
	                dialog.style.top = newTop + "px";
	            }
	        });
	    }
	}
	class OpenModalArg {
	    constructor() {
	        this.title = "Test";
	        this.init = () => { };
	        this.onCloseClick = () => true; // return false if you don't want to close
	    }
	    setTitle(title) {
	        this.title = title;
	        return this;
	    }
	    setInit(fn) {
	        this.init = fn;
	        return this;
	    }
	    setOnCloseClick(fn) {
	        this.onCloseClick = fn;
	        return this;
	    }
	}
	exports.OpenModalArg = OpenModalArg;
	function openModal(arg) {
	    let dialog = new ModalDialog(arg.title);
	    let content = dialog.getContent();
	    if (content !== null) {
	        arg.init(content, () => {
	            dialog.close();
	        });
	    }
	    dialog.open();
	    dialog.reposition();
	}
	exports.openModal = openModal;


/***/ },
/* 2 */
/***/ function(module, exports) {

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
	    if (children) {
	        children.forEach(function (n) {
	            if (typeof n === "string") {
	                e.appendChild(document.createTextNode(n));
	            }
	            else {
	                e.appendChild(n);
	            }
	        });
	    }
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
	        return createElement("a", attrs, children);
	    }
	    h.a = a;
	})(h = exports.h || (exports.h = {}));
	/**
	export namespace f {
	    function makeCreator<T extends HTMLElement>(tag: string):
	        (fn: (e:T) => void, attrs: any, children?: (HTMLElement|string)[]) => T {
	        return function(fn: (e:T) => void,
	                attrs: any, children?: (HTMLElement|string)[]): T{
	            return createElementFn<T>(fn, tag, attrs, children);
	        }
	    }

	    export let div = makeCreator<HTMLElement>("div");
	    export let h1 = makeCreator<HTMLElement>("h1");
	    export let h2 = makeCreator<HTMLElement>("h2");
	    export let h3 = makeCreator<HTMLElement>("h3");
	    export let input = makeCreator<HTMLInputElement>("input");
	    export let button = makeCreator<HTMLElement>("button");
	    export let table = makeCreator<HTMLTableElement>("table");
	    export let tbody = makeCreator<HTMLElement>("tbody");
	    export let tr = makeCreator<HTMLElement>("tr");
	    export let td = makeCreator<HTMLElement>("td");
	    export let br = makeCreator<HTMLElement>("br");
	    export let p = makeCreator<HTMLElement>("p");
	    export let select = makeCreator<HTMLSelectElement>("select");
	    export let option = makeCreator<HTMLOptionElement>("option");

	    export function form(fn: (e:HTMLFormElement) => void,
	            attrs: any, children?: (HTMLElement|string)[]): HTMLFormElement{
	        if( !("onSubmit" in attrs) ){
	            attrs.onSubmit = "return false";
	        }
	        return createElementFn<HTMLFormElement>(fn, "form", attrs, children);
	    }

	    export function a(fn: (e:HTMLElement) => void,
	            attrs: any, children?: (HTMLElement|string)[]): HTMLElement{
	        if( !("href" in attrs) ){
	            attrs.href = "javascript:void(0)"
	        }
	        return createElementFn<HTMLElement>(fn, "a", attrs, children);
	    }
	}

	export function range(from: number, to: number): number[] {
	    let r: number[] = [];
	    for(let i=from;i<=to;i++){
	        r.push(i);
	    }
	    return r;
	}

	export function interpose(sep: any, arr: any[]): any[] {
	    let r: any[] = [];
	    for(let i=0;i<arr.length;i++){
	        r.push(arr[i]);
	        if( i !== (arr.length-1) ){
	            r.push(sep);
	        }
	    }
	    return r;
	}

	*/ 


/***/ }
/******/ ]);