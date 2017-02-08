"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const typed_dom_1 = require("./typed-dom");
const service = require("./service");
class NavMode {
    constructor() {
        this.onPageChange = (_) => { };
    }
    setOnPageChange(cb) {
        this.onPageChange = cb;
    }
    triggerPageChange() {
        return __awaiter(this, void 0, void 0, function* () {
            let posts = yield this.fetchPages();
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
        this.domList = [];
    }
    createDom() {
        let dom = typed_dom_1.h.div({}, []);
        this.domList.push(dom);
        return dom;
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
            this.domList.forEach(dom => { this.updateDom(dom); });
        });
    }
    updateDom(dom) {
        let prev = typed_dom_1.h.a({}, ["<"]);
        let next = typed_dom_1.h.a({}, [">"]);
        dom.innerHTML = "";
        if (this.totalPages > 1) {
            typed_dom_1.appendToElement(dom, [
                prev,
                " ",
                next
            ]);
        }
    }
    fetchPages() {
        return __awaiter(this, void 0, void 0, function* () {
            let offset = this.currentPage * this.itemsPerPage;
            return service.listIntraclinicPosts(offset, this.itemsPerPage);
        });
    }
}
class Nav {
    constructor() {
        this.onPageChange = (_) => { };
        this.mode = new DefaultNav();
    }
    createDom() {
        return this.mode.createDom();
    }
    setOnPageChange(cb) {
        this.mode.setOnPageChange(cb);
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mode.update();
        });
    }
    triggerPageChange() {
        this.mode.triggerPageChange();
    }
}
exports.Nav = Nav;
