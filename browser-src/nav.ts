import { h, appendToElement } from "./typed-dom";
import { IntraclinicPost } from "./model/intraclinic-post";
import * as service from "./service";

abstract class NavMode {
	abstract createDom(): HTMLElement;
	abstract async fetchPages(): Promise<IntraclinicPost[]>;
	abstract async update(): Promise<void>;
	
	onPageChange: (posts: IntraclinicPost[]) => void = (_) => {};

	setOnPageChange(cb: (posts: IntraclinicPost[]) => void): void {
		this.onPageChange = cb;
	}

	async triggerPageChange() {
		let posts = await this.fetchPages();
		this.onPageChange(posts);
	}

	calcNumberOfPages(totalItems: number, itemsPerPage: number): number {
		return Math.floor((totalItems + itemsPerPage - 1) / itemsPerPage);
	}
}

class DefaultNav extends NavMode {
	private itemsPerPage: number = 10;
	private currentPage: number = 0;
	private totalPages: number = 0;
	private domList: HTMLElement[] = [];

	createDom(): HTMLElement {
		let dom = h.div({}, []);
		this.domList.push(dom);
		return dom;
	}

	async update(): Promise<void> {
		let nPosts = await service.countIntraclinicPosts();
		this.totalPages = this.calcNumberOfPages(nPosts, this.itemsPerPage);
		if( this.totalPages <= 0 ){
			this.currentPage = 0;
		} else if( this.currentPage >= this.totalPages ) {
			this.currentPage = this.totalPages - 1;
		}
		this.domList.forEach(dom => { this.updateDom(dom)} );
	}

	updateDom(dom: HTMLElement): void {
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
		dom.innerHTML = "";
		if( this.totalPages > 1 ){
			appendToElement(dom, [
				prev,
				" ",
				next
			]);
		}
	}

	async fetchPages(): Promise<IntraclinicPost[]> {
		let offset = this.currentPage * this.itemsPerPage;
		return service.listIntraclinicPosts(offset, this.itemsPerPage);
	}
}

export class Nav {
	onPageChange: (posts: IntraclinicPost[]) => void = (_) => {};
	mode: NavMode;

	constructor(){
		this.mode = new DefaultNav();
	}

	createDom(): HTMLElement {
		return this.mode.createDom();
	}

	setOnPageChange(cb: (posts: IntraclinicPost[]) => void): void {
		this.mode.setOnPageChange(cb);
	}

	async update(): Promise<void> {
		await this.mode.update();
	}

	triggerPageChange(): void {
		this.mode.triggerPageChange();
	}
}