"use strict";
const typed_dom_1 = require("./typed-dom");
class Nav {
    constructor() {
        this.prevLink = typed_dom_1.h.a({ href: undefined }, ["<"]);
        this.nextLink = typed_dom_1.h.a({ href: undefined }, [">"]);
        this.dom = typed_dom_1.h.span({}, [
            this.prevLink,
            " ",
            this.nextLink
        ]);
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
exports.Nav = Nav;
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
        this.onPageChange = () => { };
    }
    createNav() {
        let nav = new Nav();
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
        this.onPageChange();
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
            this.onPageChange();
        }
    }
    gotoNext() {
        if (this.currentPage < this.nPages) {
            this.currentPage += 1;
            this.updateNavs();
            this.onPageChange();
        }
    }
}
exports.NavManager = NavManager;
