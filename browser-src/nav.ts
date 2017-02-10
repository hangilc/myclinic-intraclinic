import { h, appendToElement } from "./typed-dom";
import { IntraclinicPost } from "./model/intraclinic-post";
import * as service from "./service";
import * as kanjidate from "kanjidate";
import * as moment from "moment";

abstract class NavMode {
	protected onPageChange: (posts: IntraclinicPost[]) => void = (_) => {};
	protected workarea: HTMLElement;
	protected navDoms: HTMLElement[];

	constructor(onPageChange: (posts: IntraclinicPost[]) => void, workarea: HTMLElement, navDoms: HTMLElement[]) {
		this.onPageChange = onPageChange;
		this.workarea = workarea;
		this.navDoms = navDoms;
	}

	abstract async update(): Promise<void>;
	abstract async fetchPosts(): Promise<IntraclinicPost[]>;

	async triggerPageChange() {
		let posts = await this.fetchPosts();
		this.onPageChange(posts);
	}

	protected calcNumberOfPages(totalItems: number, itemsPerPage: number): number {
		return Math.floor((totalItems + itemsPerPage - 1) / itemsPerPage);
	}
}

class DefaultNav extends NavMode {
	private itemsPerPage: number = 10;
	private currentPage: number = 0;
	private totalPages: number = 0;

	async update(): Promise<void> {
		let nPosts = await service.countIntraclinicPosts();
		this.totalPages = this.calcNumberOfPages(nPosts, this.itemsPerPage);
		if( this.totalPages <= 0 ){
			this.currentPage = 0;
		} else if( this.currentPage >= this.totalPages ) {
			this.currentPage = this.totalPages - 1;
		}
		this.workarea.innerHTML = "";
		this.navDoms.forEach(dom => { dom.innerHTML = ""; this.updateDom(dom); })
	}

	private updateDom(dom: HTMLElement): void {
		let prev = h.a({}, ["<"]);
		let next = h.a({}, [">"]);
		prev.addEventListener("click", event => {
			if( this.currentPage > 0 ){
				this.currentPage -= 1;
				this.triggerPageChange();
			}
		});
		next.addEventListener("click", event => {
			if( this.currentPage < (this.totalPages - 1) ){
				this.currentPage += 1;
				this.triggerPageChange();
			}
		})
		if( this.totalPages > 1 ){
			appendToElement(dom, [
				prev,
				" ",
				next
			]);
		}
	}

	async fetchPosts(): Promise<IntraclinicPost[]> {
		let offset = this.currentPage * this.itemsPerPage;
		return service.listIntraclinicPosts(offset, this.itemsPerPage);
	}

}

class ByDateNav extends NavMode {
	private pivotDate: string = "";
	private itemsPerPage: number = 10;
	private currentPage: number = 0;
	private firstPageItems: number = 0;
	private totalPages: number = 0;

	async update(): Promise<void>{
		if( this.pivotDate === "" ){
			this.currentPage = 0;
			this.firstPageItems = 0;
			this.totalPages = 0;
		} else {
			let numTotalPosts = await service.countIntraclinicPosts();
			let numOlders = await service.countIntraclinicOlderThan(this.pivotDate);
			let numNewers = numTotalPosts - numOlders;
			let rem = numNewers % this.itemsPerPage;
			if( rem === 0 ){
				this.firstPageItems = this.itemsPerPage;
				this.totalPages = this.calcNumberOfPages(numTotalPosts, this.itemsPerPage);
				this.currentPage = numNewers / this.itemsPerPage;
			} else {
				this.firstPageItems = rem;
				this.totalPages = this.calcNumberOfPages(numTotalPosts - rem, this.itemsPerPage) + 1;
				this.currentPage = (numNewers - rem) / this.itemsPerPage + 1;
			}
			if( this.currentPage >= this.totalPages ){
				this.currentPage = this.totalPages - 1;
			}
			if( this.currentPage < 0 ){
				this.currentPage = 0;
			}
		}
		this.setupWorkarea();
		this.navDoms.forEach(dom => { this.updateDom(dom); });
	}

	private setupWorkarea(): void {
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
				let m = moment({year: year, month: month - 1, day: 1}).add(1, "months");
				this.pivotDate = m.format("YYYY-MM-DD");
				await this.update();
				this.triggerPageChange();
			}
		})
		this.workarea.innerHTML = "";
		appendToElement(this.workarea, [form]);
	}

	private updateDom(dom: HTMLElement): void {
		dom.innerHTML = "";
		if( this.totalPages <= 1 ){
			return;
		}
		let prev = h.a({}, ["<"]);
		let next = h.a({}, [">"]);
		prev.addEventListener("click", event => {
			if( this.currentPage > 0 ){
				this.currentPage -= 1;
				this.triggerPageChange();
			}
		});
		next.addEventListener("click", event => {
			if( this.currentPage < (this.totalPages - 1) ){
				this.currentPage += 1;
				this.triggerPageChange();
			}
		})
		appendToElement(dom, [
			prev, " ", next
		]);
	}

	async fetchPosts(): Promise<IntraclinicPost[]> {
		if( this.totalPages <= 0 ){
			return [];
		} else {
			let extra = this.firstPageItems % this.itemsPerPage;
			let offset: number;
			let n = this.itemsPerPage;
			if( extra === 0 ){
				offset = this.itemsPerPage * this.currentPage;
			} else {
				if( this.currentPage > 0 ){
					offset = (this.currentPage - 1) * this.itemsPerPage + extra;
				} else {
					offset = 0;
					n = extra;
				}
			}
			return service.listIntraclinicPosts(offset, n);
		}
	}
}

export class Nav {
	onPageChange: (posts: IntraclinicPost[]) => void = (_) => {};
	navChoiceDom: HTMLElement;
	navWorkarea: HTMLElement;
	navDoms: HTMLElement[] = [];
	private mode: NavMode;
	private defaultMode: DefaultNav;
	private byDateMode: ByDateNav | null = null;

	constructor(onPageChange: (posts: IntraclinicPost[]) => void){
		this.onPageChange = onPageChange;
		this.navChoiceDom = this.createNavChoiceDom();
		this.navWorkarea = h.div({}, []);
		this.defaultMode = new DefaultNav(onPageChange, this.navWorkarea, this.navDoms);
		this.mode = this.defaultMode;
	}

	createDom(): HTMLElement {
		let dom = h.div({}, []);
		this.navDoms.push(dom);
		return dom;
	}

	async update(): Promise<void> {
		await this.mode.update();
	}

	triggerPageChange(): void {
		this.mode.triggerPageChange();
	}

	private createNavChoiceDom(): HTMLElement {
		let mostRecent = h.input({type: "radio", name: "choice", checked: true}, []);
		let byDate = h.input({type: "radio", name: "choice"}, []);
		mostRecent.addEventListener("change", async event => {
			if( mostRecent.checked ){
				this.mode = this.defaultMode;
				await this.update();
				this.triggerPageChange();
			}
		})
		byDate.addEventListener("change", async event => {
			if( byDate.checked ){
				this.navWorkarea.innerHTML = "";
				if( this.byDateMode == null ){
					this.byDateMode = new ByDateNav(this.onPageChange, this.navWorkarea, this.navDoms);
				}
				if( this.byDateMode !== null ){
					this.mode = this.byDateMode;
					await this.update();
					this.triggerPageChange();
				}
			}
		})
		return h.form({}, [
			mostRecent, "最新", " ",
			byDate, "日付指定", " ",
		]);
	}
}
