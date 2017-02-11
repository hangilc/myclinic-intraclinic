import { h, appendToElement } from "./typed-dom";
import { IntraclinicPost } from "./model/intraclinic-post";
import * as service from "./service";
import * as kanjidate from "kanjidate";
import * as moment from "moment";

interface PageSet {
	recalc(): Promise<void>;
	fetchPage(): Promise<IntraclinicPost[]>;
	getTotalPages(): number;
	gotoNextPage(): boolean;
	gotoPrevPage(): boolean;
}

abstract class PageSetBase implements PageSet {
	abstract recalc(): Promise<void>;
	abstract fetchPage(): Promise<IntraclinicPost[]>;

	private totalPages: number = 0;
	private currentPage: number = 0;

	getTotalPages(): number {
		return this.totalPages;
	}

	gotoNextPage(): boolean {
		if( this.currentPage < (this.totalPages - 1) ){
			this.currentPage += 1;
			return true;
		} else {
			return false;
		}
	}

	gotoPrevPage(): boolean {
		if( this.currentPage > 0 ){
			this.currentPage -= 1;
			return true;
		} else {
			return false;
		}
	}

	protected setTotalPages(totalPages: number): void {
		this.totalPages = totalPages;
	}

	protected setCurrentPage(currentPage: number): void {
		if( currentPage >= this.totalPages ){
			currentPage = this.totalPages - 1;
		}
		if( currentPage < 0 ){
			currentPage = 0;
		}
		this.currentPage = currentPage;
	}

	protected getCurrentPage(): number {
		return this.currentPage;
	}

	protected calcNumberOfPages(totalItems: number, itemsPerPage: number): number {
		return Math.floor((totalItems + itemsPerPage - 1) / itemsPerPage);
	}
}

class ChronoPageSet extends PageSetBase implements PageSet {
	private itemsPerPage: number = 10;

	async recalc(): Promise<void> {
		let nPosts = await service.countIntraclinicPosts();
		this.setTotalPages(this.calcNumberOfPages(nPosts, this.itemsPerPage));
		this.setCurrentPage(0);
	}

	async fetchPage(): Promise<IntraclinicPost[]> {
		if( this.getTotalPages() <= 0 ){
			return [];
		}
		let offset = this.getCurrentPage() * this.itemsPerPage;
		return service.listIntraclinicPosts(offset, this.itemsPerPage);
	}
}

class ByMonthPageSet extends PageSetBase implements PageSet {
	private itemsPerPage: number = 10;
	private pivotDate: string = "";
	private firstPageItems: number;

	setMonth(year: number, month: number): void {
		let m = moment({year: year, month: month - 1, day: 1});
		if( !m.isValid() ){
			alert("月の設定が不適切です。");
			return;
		}
		m = m.add(1, "months");
		this.pivotDate = m.format("YYYY-MM-DD");
	}

	async recalc(): Promise<void> {
		if( this.pivotDate === "" ){
			return;
		}
		let numTotalPosts = await service.countIntraclinicPosts();
		let numOlders = await service.countIntraclinicOlderThan(this.pivotDate);
		let numNewers = numTotalPosts - numOlders;
		let rem = numNewers % this.itemsPerPage;
		if( rem === 0 ){
			this.firstPageItems = this.itemsPerPage;
			this.setTotalPages(this.calcNumberOfPages(numTotalPosts, this.itemsPerPage));
			this.setCurrentPage(numNewers / this.itemsPerPage);
		} else {
			this.firstPageItems = rem;
			this.setTotalPages(this.calcNumberOfPages(numTotalPosts - rem, this.itemsPerPage) + 1);
			this.setCurrentPage((numNewers - rem) / this.itemsPerPage + 1);
		}
	}

	async fetchPage(): Promise<IntraclinicPost[]> {
		if( this.getTotalPages() <= 0 ){
			return [];
		} else {
			let extra = this.firstPageItems % this.itemsPerPage;
			let offset: number;
			let n = this.itemsPerPage;
			if( extra === 0 ){
				offset = this.itemsPerPage * this.getCurrentPage();
			} else {
				if( this.getCurrentPage() > 0 ){
					offset = (this.getCurrentPage() - 1) * this.itemsPerPage + extra;
				} else {
					offset = 0;
					n = extra;
				}
			}
			return service.listIntraclinicPosts(offset, n);
		}
	}

}

class SearchPageSet extends PageSetBase implements PageSet {
	private itemsPerPage = 10;
	private searchText: string = "";

	async recalc(): Promise<void> {
		if( this.searchText === "" ){
			return;
		}
		let nPosts = await service.countIntraclinicSearch(this.searchText);
		let totalPages = this.calcNumberOfPages(nPosts, this.itemsPerPage);
		this.setTotalPages(totalPages);
		this.setCurrentPage(0);
	}

	async fetchPage(): Promise<IntraclinicPost[]> {
		if( this.getTotalPages() === 0 ){
			return [];
		} else {
			let offset = this.getCurrentPage() * this.itemsPerPage;
			let n = this.itemsPerPage;
			return service.searchIntraclinic(this.searchText, offset, n);
		}
	}

	setup(searchText: string): void {
		this.searchText = searchText;
	}
}

interface NavWidget {
	getPageSet(): PageSet;
	setupWorkarea(workarea: HTMLElement): void;
}

class ChronoNavWidget implements NavWidget {
	private pageSet: PageSet = new ChronoPageSet();

	getPageSet(): PageSet {
		return this.pageSet;
	}

	setupWorkarea(workarea: HTMLElement): void {

	}
}

class MonthSelector {
	dom: HTMLElement;
	private pageSet: ByMonthPageSet;
	private onPageSet: (posts: IntraclinicPost[]) => void;
	private updateNavDoms: (pageSet: PageSet) => void;

	constructor(pageSet: ByMonthPageSet, onPageSet: (posts: IntraclinicPost[]) => void,
		updateNavDoms: (pageSet: PageSet) => void){
		this.dom = this.createDom();
		this.pageSet = pageSet;
		this.onPageSet = onPageSet;
		this.updateNavDoms = updateNavDoms;
	}

	private createDom(): HTMLElement {
		let nenInput = h.input({type: "text", size: 2}, []);
		let monthInput = h.input({type: "text", size: 2}, []);
		let form = h.form({}, [
			"平成", nenInput, "年", " ",
			monthInput, "月", " ",
			h.button({type: "submit"}, ["入力"])
		]);
		form.addEventListener("submit", async event => {
			let nen = +nenInput.value;
			let month = +monthInput.value;
			if( nen > 0 && month > 0 ){
				let year = kanjidate.fromGengou("平成", nen);
				this.pageSet.setMonth(year, month);
				await this.pageSet.recalc();
				this.updateNavDoms(this.pageSet);
				let posts = await this.pageSet.fetchPage();
				this.onPageSet(posts);
			}
		});
		return h.div({}, [form]);
	}
}

class ByMonthNavWidget implements NavWidget {
	private pageSet: ByMonthPageSet = new ByMonthPageSet();
	private workareaContent: MonthSelector;
	private onPageChange: (posts: IntraclinicPost[]) => void;

	constructor(onPageChange: (posts: IntraclinicPost[]) => void,
		updateNavDoms: (pageSet: PageSet) => void) {
		this.workareaContent = new MonthSelector(this.pageSet, onPageChange, updateNavDoms);
	}

	getPageSet(): PageSet {
		return this.pageSet;
	}

	setupWorkarea(workarea: HTMLElement): void {
		workarea.appendChild(this.workareaContent.dom);
	}
}

class SearchTextInput {
	dom: HTMLElement;

	constructor(pageSet: SearchPageSet, onPageChange: (posts: IntraclinicPost[]) => void,
		updateNavDoms: (pageSet: PageSet) => void){
		this.dom = this.createDom(pageSet, onPageChange, updateNavDoms);
	}

	private createDom(pageSet: SearchPageSet, onPageChange: (posts: IntraclinicPost[]) => void,
		updateNavDoms: (pageSet: PageSet) => void): HTMLElement {
		let input = h.input({}, []);
		let button = h.button({}, ["検索"]);
		button.addEventListener("click", async event => {
			let text = input.value.trim();
			if( text === "" ){
				return;
			}
			pageSet.setup(text);
			await pageSet.recalc();
			updateNavDoms(pageSet);
			let posts = await pageSet.fetchPage();
			onPageChange(posts);
		});
		return h.div({}, [
			h.form({}, [
				input, " ",
				button
			])
		])
	}
}

class SearchNavWidget implements NavWidget {
	private pageSet: SearchPageSet = new SearchPageSet();
	private workareaContent: SearchTextInput;

	constructor(onPageChange: (posts: IntraclinicPost[]) => void,
		updateNavDoms: (pageSet: PageSet) => void) {
		this.workareaContent = new SearchTextInput(this.pageSet, onPageChange, updateNavDoms);
	}

	getPageSet(): PageSet {
		return this.pageSet;
	}

	setupWorkarea(workarea: HTMLElement): void {
		workarea.appendChild(this.workareaContent.dom);
	}
}

type NavKind = "default" | "by-month" | "search";

class NavFactory {
	private cache: {[kind: string]: NavWidget} = {};
	private onPageChange: (posts: IntraclinicPost[]) => void;
	private updateNavDoms: (pageSet: PageSet) => void;

	constructor(onPageChange: (posts: IntraclinicPost[]) => void,
		updateNavDoms: (pageSet: PageSet) => void) {
		this.onPageChange = onPageChange;
		this.updateNavDoms = updateNavDoms;
	}

	get(kind: NavKind): NavWidget {
		if( !(kind in this.cache) ){
			this.cache[kind] = this.create(kind);
		}
		return this.cache[kind];
	}

	private create(kind: NavKind): NavWidget {
		switch(kind){
			case "default": return new ChronoNavWidget();
			case "by-month": return new ByMonthNavWidget(this.onPageChange, this.updateNavDoms);
			case "search": return new SearchNavWidget(this.onPageChange, this.updateNavDoms);
		}
	}
}

interface NavDomCallbacks {
	onPrev: () => void;
	onNext: () => void;
}

class NavDom {
	dom: HTMLElement;
	callbacks: NavDomCallbacks;

	constructor(callbacks: NavDomCallbacks) {
		this.dom = this.createDom();
		this.callbacks = callbacks;
	}

	show(): void {
		this.dom.style.display = "";
	}

	hide(): void {
		this.dom.style.display = "none";
	}

	private createDom(): HTMLElement {
		let prev = h.a({}, ["<"]);
		let next = h.a({}, [">"]);
		prev.addEventListener("click", event => {
			this.callbacks.onPrev();
		});
		next.addEventListener("click", event => {
			this.callbacks.onNext();
		})
		return h.div({}, [
			prev, " ", next
		]);
	}
}

export class NavManager {
	onPageChange: (posts: IntraclinicPost[]) => void;
	workarea: HTMLElement;
	current: NavWidget | null;
	navFactory: NavFactory;
	navDomList: NavDom[] = [];
	navDomCallbacks: NavDomCallbacks;

	constructor(onPageChange: (posts: IntraclinicPost[]) => void, menuArea: HTMLElement, workarea: HTMLElement) {
		this.onPageChange = onPageChange;
		this.setupMenu(menuArea);
		this.workarea = workarea;
		this.navFactory = new NavFactory(onPageChange, (pageSet: PageSet) => { this.updateNavDoms(pageSet); });
		this.navDomCallbacks = {
			onPrev: () => { this.onPrev(); },
			onNext: () => { this.onNext(); }
		}
	}

	createDom(): HTMLElement {
		let navDom = new NavDom(this.navDomCallbacks);
		this.navDomList.push(navDom);
		return navDom.dom;
	}

	async init(): Promise<void> {
		return this.switchTo("default");
	}

	async recalc(): Promise<void> {
		let current = this.current;
		if( current !== null ){
			return current.getPageSet().recalc();
		}
	}

	async triggerPageChange(): Promise<void> {
		let current = this.current;
		if( current === null ){
			return;
		}
		let posts = await current.getPageSet().fetchPage();
		this.onPageChange(posts);
	}

	private async switchTo(kind: NavKind): Promise<void> {
		let navWidget = this.navFactory.get(kind);
		this.current = navWidget;
		await navWidget.getPageSet().recalc();
		this.updateNavDoms(navWidget.getPageSet());
		this.workarea.innerHTML = "";
		await navWidget.setupWorkarea(this.workarea);
		this.triggerPageChange();
	}

	private updateNavDoms(pageSet: PageSet): void {
		if( pageSet.getTotalPages() > 1 ){
			this.navDomList.forEach(navDom => { navDom.show(); });
		} else {
			this.navDomList.forEach(navDom => { navDom.hide(); });
		}
	}

	private onPrev() {
		let current = this.current;
		if( current !== null ){
			let ok = current.getPageSet().gotoPrevPage();
			if( ok ){
				this.triggerPageChange();
			}
		}
	}

	private onNext() {
		let current = this.current;
		if( current !== null ){
			let ok = current.getPageSet().gotoNextPage();
			if( ok ){
				this.triggerPageChange();
			}
		}
	}

	private setupMenu(wrapper: HTMLElement): void {
		let mostRecent = h.input({type: "radio", name: "choice", checked: true}, []);
		let byMonth = h.input({type: "radio", name: "choice"}, []);
		let search = h.input({type: "radio", name: "choice"}, []);
		mostRecent.addEventListener("click", event => {
			this.switchTo("default");
		})
		byMonth.addEventListener("click", event => {
			this.switchTo("by-month");
		})
		search.addEventListener("click", event => {
			this.switchTo("search");
		})
		appendToElement(wrapper, [
			h.form({}, [
				mostRecent, "日付順", " ",
				byMonth, "月指定", " ",
				search, "検索"
			])
		])
	}
}

