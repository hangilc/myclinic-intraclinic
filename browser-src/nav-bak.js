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
class DefaultNav {
    constructor() {
        this.postsPerPage = 10;
        this.prevLink = typed_dom_1.h.a({ href: undefined }, ["<"]);
        this.nextLink = typed_dom_1.h.a({ href: undefined }, [">"]);
        this.dom = typed_dom_1.h.span({}, [
            this.prevLink,
            " ",
            this.nextLink
        ]);
    }
    setOnPageChange(cb) {
        this.onPageChange = cb;
    }
    triggerPageChange() {
    }
    onPrevLinkClick(cb) {
        this.prevLink.addEventListener("click", cb);
    }
    onNextLinkClick(cb) {
        this.nextLink.addEventListener("click", cb);
    }
    enablePrev(enable) {
        if (enable) {
            this.prevLink.href = "javascript: void(0)";
        }
        else {
            delete this.prevLink.href;
        }
    }
    enableNext(enable) {
        if (enable) {
            this.nextLink.href = "javascript: void(0)";
        }
        else {
            delete this.nextLink.href;
        }
    }
}
function calcNumberOfPages(totalItems, itemsPerPage) {
    return Math.floor((totalItems + itemsPerPage - 1) / itemsPerPage);
}
class NavManager {
    constructor() {
        this.postsPerPage = 10;
        this.nPosts = 0;
        this.nPages = 0;
        this.currentPage = 1;
        this.navs = [];
        this.onPageChange = (_) => { };
    }
    createNav() {
        let nav = new DefaultNav();
        nav.onPrevLinkClick(event => {
            this.gotoPrev();
        });
        nav.onNextLinkClick(event => {
            this.gotoNext();
        });
        this.navs.push(nav);
        this.updateNavs();
        return nav.dom;
    }
    updateTotalNumberOfPosts(nPosts) {
        this.nPosts = nPosts;
        this.nPages = calcNumberOfPages(nPosts, this.postsPerPage);
        if (this.currentPage > this.nPages) {
            if (this.nPages > 0) {
                this.currentPage = this.nPages;
            }
            else {
                this.currentPage = 1;
            }
        }
        this.updateNavs();
    }
    getCurrentOffset() {
        return (this.currentPage - 1) * this.postsPerPage;
    }
    getPostsperPage() {
        return this.postsPerPage;
    }
    setOnPageChange(cb) {
        this.onPageChange = cb;
    }
    triggerPageChange() {
        return __awaiter(this, void 0, void 0, function* () {
            let posts = yield service.listIntraclinicPosts(this.getCurrentOffset(), this.getPostsperPage());
            this.onPageChange(posts);
        });
    }
    updateNavs() {
        let enablePrev = this.currentPage > 1;
        let enableNext = this.currentPage < this.nPages;
        this.navs.forEach(nav => {
            nav.enablePrev(enablePrev);
            nav.enableNext(enableNext);
        });
    }
    gotoPrev() {
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updateNavs();
            this.triggerPageChange();
        }
    }
    gotoNext() {
        if (this.currentPage < this.nPages) {
            this.currentPage += 1;
            this.updateNavs();
            this.triggerPageChange();
        }
    }
}
exports.NavManager = NavManager;
