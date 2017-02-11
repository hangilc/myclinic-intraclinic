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
const kanjidate = require("kanjidate");
const moment = require("moment");
class PageSetBase {
    constructor() {
        this.totalPages = 0;
        this.currentPage = 0;
    }
    getTotalPages() {
        return this.totalPages;
    }
    gotoNextPage() {
        if (this.currentPage < (this.totalPages - 1)) {
            this.currentPage += 1;
            return true;
        }
        else {
            return false;
        }
    }
    gotoPrevPage() {
        if (this.currentPage > 0) {
            this.currentPage -= 1;
            return true;
        }
        else {
            return false;
        }
    }
    setTotalPages(totalPages) {
        this.totalPages = totalPages;
    }
    setCurrentPage(currentPage) {
        if (currentPage >= this.totalPages) {
            currentPage = this.totalPages - 1;
        }
        if (currentPage < 0) {
            currentPage = 0;
        }
        this.currentPage = currentPage;
    }
    getCurrentPage() {
        return this.currentPage;
    }
    calcNumberOfPages(totalItems, itemsPerPage) {
        return Math.floor((totalItems + itemsPerPage - 1) / itemsPerPage);
    }
}
class ChronoPageSet extends PageSetBase {
    constructor() {
        super(...arguments);
        this.itemsPerPage = 10;
    }
    recalc() {
        return __awaiter(this, void 0, void 0, function* () {
            let nPosts = yield service.countIntraclinicPosts();
            this.setTotalPages(this.calcNumberOfPages(nPosts, this.itemsPerPage));
            this.setCurrentPage(0);
        });
    }
    fetchPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getTotalPages() <= 0) {
                return [];
            }
            let offset = this.getCurrentPage() * this.itemsPerPage;
            return service.listIntraclinicPosts(offset, this.itemsPerPage);
        });
    }
}
class ByMonthPageSet extends PageSetBase {
    constructor() {
        super(...arguments);
        this.itemsPerPage = 10;
        this.pivotDate = "";
    }
    setMonth(year, month) {
        let m = moment({ year: year, month: month - 1, day: 1 });
        if (!m.isValid()) {
            alert("月の設定が不適切です。");
            return;
        }
        m = m.add(1, "months");
        this.pivotDate = m.format("YYYY-MM-DD");
    }
    recalc() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pivotDate === "") {
                return;
            }
            let numTotalPosts = yield service.countIntraclinicPosts();
            let numOlders = yield service.countIntraclinicOlderThan(this.pivotDate);
            let numNewers = numTotalPosts - numOlders;
            let rem = numNewers % this.itemsPerPage;
            if (rem === 0) {
                this.firstPageItems = this.itemsPerPage;
                this.setTotalPages(this.calcNumberOfPages(numTotalPosts, this.itemsPerPage));
                this.setCurrentPage(numNewers / this.itemsPerPage);
            }
            else {
                this.firstPageItems = rem;
                this.setTotalPages(this.calcNumberOfPages(numTotalPosts - rem, this.itemsPerPage) + 1);
                this.setCurrentPage((numNewers - rem) / this.itemsPerPage + 1);
            }
        });
    }
    fetchPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getTotalPages() <= 0) {
                return [];
            }
            else {
                let extra = this.firstPageItems % this.itemsPerPage;
                let offset;
                let n = this.itemsPerPage;
                if (extra === 0) {
                    offset = this.itemsPerPage * this.getCurrentPage();
                }
                else {
                    if (this.getCurrentPage() > 0) {
                        offset = (this.getCurrentPage() - 1) * this.itemsPerPage + extra;
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
class SearchPageSet extends PageSetBase {
    constructor() {
        super(...arguments);
        this.itemsPerPage = 10;
        this.searchText = "";
    }
    recalc() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.searchText === "") {
                return;
            }
            let nPosts = yield service.countIntraclinicSearch(this.searchText);
            let totalPages = this.calcNumberOfPages(nPosts, this.itemsPerPage);
            this.setTotalPages(totalPages);
            this.setCurrentPage(0);
        });
    }
    fetchPage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getTotalPages() === 0) {
                return [];
            }
            else {
                let offset = this.getCurrentPage() * this.itemsPerPage;
                let n = this.itemsPerPage;
                return service.searchIntraclinic(this.searchText, offset, n);
            }
        });
    }
    setup(searchText) {
        this.searchText = searchText;
    }
}
class ChronoNavWidget {
    constructor() {
        this.pageSet = new ChronoPageSet();
    }
    getPageSet() {
        return this.pageSet;
    }
    setupWorkarea(workarea) {
    }
}
class MonthSelector {
    constructor(pageSet, onPageSet, updateNavDoms) {
        this.dom = this.createDom();
        this.pageSet = pageSet;
        this.onPageSet = onPageSet;
        this.updateNavDoms = updateNavDoms;
    }
    createDom() {
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
                this.pageSet.setMonth(year, month);
                yield this.pageSet.recalc();
                this.updateNavDoms(this.pageSet);
                let posts = yield this.pageSet.fetchPage();
                this.onPageSet(posts);
            }
        }));
        return typed_dom_1.h.div({}, [form]);
    }
}
class ByMonthNavWidget {
    constructor(onPageChange, updateNavDoms) {
        this.pageSet = new ByMonthPageSet();
        this.workareaContent = new MonthSelector(this.pageSet, onPageChange, updateNavDoms);
    }
    getPageSet() {
        return this.pageSet;
    }
    setupWorkarea(workarea) {
        workarea.appendChild(this.workareaContent.dom);
    }
}
class SearchTextInput {
    constructor(pageSet, onPageChange, updateNavDoms) {
        this.dom = this.createDom(pageSet, onPageChange, updateNavDoms);
    }
    createDom(pageSet, onPageChange, updateNavDoms) {
        let input = typed_dom_1.h.input({}, []);
        let button = typed_dom_1.h.button({}, ["検索"]);
        button.addEventListener("click", (event) => __awaiter(this, void 0, void 0, function* () {
            let text = input.value.trim();
            if (text === "") {
                return;
            }
            pageSet.setup(text);
            yield pageSet.recalc();
            updateNavDoms(pageSet);
            let posts = yield pageSet.fetchPage();
            onPageChange(posts);
        }));
        return typed_dom_1.h.div({}, [
            typed_dom_1.h.form({}, [
                input, " ",
                button
            ])
        ]);
    }
}
class SearchNavWidget {
    constructor(onPageChange, updateNavDoms) {
        this.pageSet = new SearchPageSet();
        this.workareaContent = new SearchTextInput(this.pageSet, onPageChange, updateNavDoms);
    }
    getPageSet() {
        return this.pageSet;
    }
    setupWorkarea(workarea) {
        workarea.appendChild(this.workareaContent.dom);
    }
}
class NavFactory {
    constructor(onPageChange, updateNavDoms) {
        this.cache = {};
        this.onPageChange = onPageChange;
        this.updateNavDoms = updateNavDoms;
    }
    get(kind) {
        if (!(kind in this.cache)) {
            this.cache[kind] = this.create(kind);
        }
        return this.cache[kind];
    }
    create(kind) {
        switch (kind) {
            case "default": return new ChronoNavWidget();
            case "by-month": return new ByMonthNavWidget(this.onPageChange, this.updateNavDoms);
            case "search": return new SearchNavWidget(this.onPageChange, this.updateNavDoms);
        }
    }
}
class NavDom {
    constructor(callbacks) {
        this.dom = this.createDom();
        this.callbacks = callbacks;
    }
    show() {
        this.dom.style.display = "";
    }
    hide() {
        this.dom.style.display = "none";
    }
    createDom() {
        let prev = typed_dom_1.h.a({}, ["<"]);
        let next = typed_dom_1.h.a({}, [">"]);
        prev.addEventListener("click", event => {
            this.callbacks.onPrev();
        });
        next.addEventListener("click", event => {
            this.callbacks.onNext();
        });
        return typed_dom_1.h.div({}, [
            prev, " ", next
        ]);
    }
}
class NavManager {
    constructor(onPageChange, menuArea, workarea) {
        this.navDomList = [];
        this.onPageChange = onPageChange;
        this.setupMenu(menuArea);
        this.workarea = workarea;
        this.navFactory = new NavFactory(onPageChange, (pageSet) => { this.updateNavDoms(pageSet); });
        this.navDomCallbacks = {
            onPrev: () => { this.onPrev(); },
            onNext: () => { this.onNext(); }
        };
    }
    createDom() {
        let navDom = new NavDom(this.navDomCallbacks);
        this.navDomList.push(navDom);
        return navDom.dom;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.switchTo("default");
        });
    }
    recalc() {
        return __awaiter(this, void 0, void 0, function* () {
            let current = this.current;
            if (current !== null) {
                return current.getPageSet().recalc();
            }
        });
    }
    triggerPageChange() {
        return __awaiter(this, void 0, void 0, function* () {
            let current = this.current;
            if (current === null) {
                return;
            }
            let posts = yield current.getPageSet().fetchPage();
            this.onPageChange(posts);
        });
    }
    switchTo(kind) {
        return __awaiter(this, void 0, void 0, function* () {
            let navWidget = this.navFactory.get(kind);
            this.current = navWidget;
            yield navWidget.getPageSet().recalc();
            this.updateNavDoms(navWidget.getPageSet());
            this.workarea.innerHTML = "";
            yield navWidget.setupWorkarea(this.workarea);
            this.triggerPageChange();
        });
    }
    updateNavDoms(pageSet) {
        if (pageSet.getTotalPages() > 1) {
            this.navDomList.forEach(navDom => { navDom.show(); });
        }
        else {
            this.navDomList.forEach(navDom => { navDom.hide(); });
        }
    }
    onPrev() {
        let current = this.current;
        if (current !== null) {
            let ok = current.getPageSet().gotoPrevPage();
            if (ok) {
                this.triggerPageChange();
            }
        }
    }
    onNext() {
        let current = this.current;
        if (current !== null) {
            let ok = current.getPageSet().gotoNextPage();
            if (ok) {
                this.triggerPageChange();
            }
        }
    }
    setupMenu(wrapper) {
        let mostRecent = typed_dom_1.h.input({ type: "radio", name: "choice", checked: true }, []);
        let byMonth = typed_dom_1.h.input({ type: "radio", name: "choice" }, []);
        let search = typed_dom_1.h.input({ type: "radio", name: "choice" }, []);
        mostRecent.addEventListener("click", event => {
            this.switchTo("default");
        });
        byMonth.addEventListener("click", event => {
            this.switchTo("by-month");
        });
        search.addEventListener("click", event => {
            this.switchTo("search");
        });
        typed_dom_1.appendToElement(wrapper, [
            typed_dom_1.h.form({}, [
                mostRecent, "日付順", " ",
                byMonth, "月指定", " ",
                search, "検索"
            ])
        ]);
    }
}
exports.NavManager = NavManager;
