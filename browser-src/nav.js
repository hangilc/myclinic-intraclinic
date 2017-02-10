"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const typed_dom_1 = require("./typed-dom");
const service = require("./service");
const kanjidate = require("kanjidate");
const moment = require("moment");
class NavMode {
    constructor(onPageChange, workarea, navDoms) {
        this.onPageChange = (_) => { };
        this.onPageChange = onPageChange;
        this.workarea = workarea;
        this.navDoms = navDoms;
    }
    triggerPageChange() {
        return __awaiter(this, void 0, void 0, function* () {
            let posts = yield this.fetchPosts();
            this.onPageChange(posts);
        });
    }
    calcNumberOfPages(totalItems, itemsPerPage) {
        return Math.floor((totalItems + itemsPerPage - 1) / itemsPerPage);
    }
}
class DefaultNav extends NavMode {
    constructor() {
        super(...arguments);
        this.itemsPerPage = 10;
        this.currentPage = 0;
        this.totalPages = 0;
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            let nPosts = yield service.countIntraclinicPosts();
            this.totalPages = this.calcNumberOfPages(nPosts, this.itemsPerPage);
            if (this.totalPages <= 0) {
                this.currentPage = 0;
            }
            else if (this.currentPage >= this.totalPages) {
                this.currentPage = this.totalPages - 1;
            }
            this.workarea.innerHTML = "";
            this.navDoms.forEach(dom => { dom.innerHTML = ""; this.updateDom(dom); });
        });
    }
    updateDom(dom) {
        let prev = typed_dom_1.h.a({}, ["<"]);
        let next = typed_dom_1.h.a({}, [">"]);
        prev.addEventListener("click", event => {
            if (this.currentPage > 0) {
                this.currentPage -= 1;
                this.triggerPageChange();
            }
        });
        next.addEventListener("click", event => {
            if (this.currentPage < (this.totalPages - 1)) {
                this.currentPage += 1;
                this.triggerPageChange();
            }
        });
        if (this.totalPages > 1) {
            typed_dom_1.appendToElement(dom, [
                prev,
                " ",
                next
            ]);
        }
    }
    fetchPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            let offset = this.currentPage * this.itemsPerPage;
            return service.listIntraclinicPosts(offset, this.itemsPerPage);
        });
    }
}
class ByDateNav extends NavMode {
    constructor() {
        super(...arguments);
        this.pivotDate = "";
        this.itemsPerPage = 10;
        this.currentPage = 0;
        this.firstPageItems = 0;
        this.totalPages = 0;
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pivotDate === "") {
                this.currentPage = 0;
                this.firstPageItems = 0;
                this.totalPages = 0;
            }
            else {
                let numTotalPosts = yield service.countIntraclinicPosts();
                let numOlders = yield service.countIntraclinicOlderThan(this.pivotDate);
                let numNewers = numTotalPosts - numOlders;
                let rem = numNewers % this.itemsPerPage;
                if (rem === 0) {
                    this.firstPageItems = this.itemsPerPage;
                    this.totalPages = this.calcNumberOfPages(numTotalPosts, this.itemsPerPage);
                    this.currentPage = numNewers / this.itemsPerPage;
                }
                else {
                    this.firstPageItems = rem;
                    this.totalPages = this.calcNumberOfPages(numTotalPosts - rem, this.itemsPerPage) + 1;
                    this.currentPage = (numNewers - rem) / this.itemsPerPage + 1;
                }
                if (this.currentPage >= this.totalPages) {
                    this.currentPage = this.totalPages - 1;
                }
                if (this.currentPage < 0) {
                    this.currentPage = 0;
                }
            }
            this.setupWorkarea();
            this.navDoms.forEach(dom => { this.updateDom(dom); });
        });
    }
    setupWorkarea() {
        let nenInput = typed_dom_1.h.input({ type: "text", size: 2 }, []);
        let monthInput = typed_dom_1.h.input({ type: "text", size: 2 }, []);
        let form = typed_dom_1.h.form({}, [
            "平成", nenInput, "年", " ",
            monthInput, "月", " ",
            typed_dom_1.h.button({ type: "submit" }, ["入力"])
        ]);
        form.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
            let nen = +nenInput.value;
            let month = +monthInput.value;
            if (nen > 0 && month > 0) {
                let year = kanjidate.fromGengou("平成", nen);
                let m = moment({ year: year, month: month - 1, day: 1 }).add(1, "months");
                this.pivotDate = m.format("YYYY-MM-DD");
                yield this.update();
                this.triggerPageChange();
            }
        }));
        this.workarea.innerHTML = "";
        typed_dom_1.appendToElement(this.workarea, [form]);
    }
    updateDom(dom) {
        dom.innerHTML = "";
        if (this.totalPages <= 1) {
            return;
        }
        let prev = typed_dom_1.h.a({}, ["<"]);
        let next = typed_dom_1.h.a({}, [">"]);
        prev.addEventListener("click", event => {
            if (this.currentPage > 0) {
                this.currentPage -= 1;
                this.triggerPageChange();
            }
        });
        next.addEventListener("click", event => {
            if (this.currentPage < (this.totalPages - 1)) {
                this.currentPage += 1;
                this.triggerPageChange();
            }
        });
        typed_dom_1.appendToElement(dom, [
            prev, " ", next
        ]);
    }
    fetchPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.totalPages <= 0) {
                return [];
            }
            else {
                let extra = this.firstPageItems % this.itemsPerPage;
                let offset;
                let n = this.itemsPerPage;
                if (extra === 0) {
                    offset = this.itemsPerPage * this.currentPage;
                }
                else {
                    if (this.currentPage > 0) {
                        offset = (this.currentPage - 1) * this.itemsPerPage + extra;
                    }
                    else {
                        offset = 0;
                        n = extra;
                    }
                }
                return service.listIntraclinicPosts(offset, n);
            }
        });
    }
}
class Nav {
    constructor(onPageChange) {
        this.onPageChange = (_) => { };
        this.navDoms = [];
        this.byDateMode = null;
        this.onPageChange = onPageChange;
        this.navChoiceDom = this.createNavChoiceDom();
        this.navWorkarea = typed_dom_1.h.div({}, []);
        this.defaultMode = new DefaultNav(onPageChange, this.navWorkarea, this.navDoms);
        this.mode = this.defaultMode;
    }
    createDom() {
        let dom = typed_dom_1.h.div({}, []);
        this.navDoms.push(dom);
        return dom;
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mode.update();
        });
    }
    triggerPageChange() {
        this.mode.triggerPageChange();
    }
    createNavChoiceDom() {
        let mostRecent = typed_dom_1.h.input({ type: "radio", name: "choice", checked: true }, []);
        let byDate = typed_dom_1.h.input({ type: "radio", name: "choice" }, []);
        mostRecent.addEventListener("change", (event) => __awaiter(this, void 0, void 0, function* () {
            if (mostRecent.checked) {
                this.mode = this.defaultMode;
                yield this.update();
                this.triggerPageChange();
            }
        }));
        byDate.addEventListener("change", (event) => __awaiter(this, void 0, void 0, function* () {
            if (byDate.checked) {
                this.navWorkarea.innerHTML = "";
                if (this.byDateMode == null) {
                    this.byDateMode = new ByDateNav(this.onPageChange, this.navWorkarea, this.navDoms);
                }
                if (this.byDateMode !== null) {
                    this.mode = this.byDateMode;
                    yield this.update();
                    this.triggerPageChange();
                }
            }
        }));
        return typed_dom_1.h.form({}, [
            mostRecent, "最新", " ",
            byDate, "日付指定", " ",
        ]);
    }
}
exports.Nav = Nav;
