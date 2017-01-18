import { h } from "./typed-dom";

export class Nav {
	dom: HTMLElement;
	private prevLink: HTMLAnchorElement;
	private nextLink: HTMLAnchorElement;

	constructor(){
		this.prevLink = h.a({ href: undefined }, ["<"]);
		this.nextLink = h.a({ href: undefined }, [">"]);
		this.dom = h.span({}, [
			this.prevLink,
			" ",
			this.nextLink
		]);
	}

	onPrevLinkClick(cb: (event: Event) => void){
		this.prevLink.addEventListener("click", cb);
	}

	onNextLinkClick(cb: (event: Event) => void){
		this.nextLink.addEventListener("click", cb);
	}

	enablePrev(enable: boolean){
		if( enable ){
			this.prevLink.href = "javascript: void(0)";
		} else {
			delete this.prevLink.href;
		}
	}

	enableNext(enable: boolean){
		if( enable ){
			this.nextLink.href = "javascript: void(0)";
		} else {
			delete this.nextLink.href;
		}
	}
}

function calcNumberOfPages(totalItems: number, itemsPerPage: number): number {
	return Math.floor((totalItems + itemsPerPage - 1) / itemsPerPage);
}

export class NavManager {
	private postsPerPage: number = 10;
	private nPosts: number = 0;
	private nPages: number = 0;
	private currentPage: number = 1;
	private navs: Nav[] = [];
	private onPageChange: () => void = () => {};

	constructor(){

	}

	createNav(): HTMLElement {
		let nav = new Nav();
		nav.onPrevLinkClick(event => {
			this.gotoPrev();
		})
		nav.onNextLinkClick(event => {
			this.gotoNext();
		})
		this.navs.push(nav);
		this.updateNavs();
		return nav.dom;
	}

	updateTotalNumberOfPosts(nPosts: number) {
		this.nPosts = nPosts;
		this.nPages = calcNumberOfPages(nPosts, this.postsPerPage);
		if( this.currentPage > this.nPages ){
			if( this.nPages > 0 ){
				this.currentPage = this.nPages;
			} else {
				this.currentPage = 1;
			}
		}
		this.updateNavs();
	}

	getCurrentOffset(): number {
		return (this.currentPage - 1) * this.postsPerPage;
	}

	getPostsperPage(): number {
		return this.postsPerPage;
	}

	setOnPageChange(cb: () => void){
		this.onPageChange = cb;
	}

	triggerPageChange() {
		this.onPageChange();
	}

	private updateNavs(){
		let enablePrev = this.currentPage > 1;
		let enableNext = this.currentPage < this.nPages;
		this.navs.forEach(nav => {
			nav.enablePrev(enablePrev);
			nav.enableNext(enableNext);
		})
	}

	private gotoPrev(){
		if( this.currentPage > 1 ){
			this.currentPage -= 1;
			this.updateNavs();
			this.onPageChange();
		}
	}

	private gotoNext(){
		if( this.currentPage < this.nPages ){
			this.currentPage += 1;
			this.updateNavs();
			this.onPageChange();
		}
	}
}