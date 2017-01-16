"use strict";
const typed_dom_1 = require("./typed-dom");
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
        if (this.screen !== null) {
            if (this.dialog !== null) {
                document.body.appendChild(this.screen);
                document.body.appendChild(this.dialog);
            }
        }
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
