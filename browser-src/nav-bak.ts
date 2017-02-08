import { h } from "./typed-dom";
import { IntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment } from "./model/intraclinic-comment";
import * as service from "./service";

interface Nav {
	dom: HTMLElement;
	setOnPageChange(cb: (posts: IntraclinicPost[]) => void);
	triggerPageChange(): void;
}

class DefaultNav implements Nav {
	dom: HTMLElement;
	onPageChange: (posts: IntraclinicPost[]) => void;
	private prevLink: HTMLAnchorElement;
	private nextLink: HTMLAnchorElement;
	private postsPerPage: number = 10;

	constructor(){
		this.prevLink = h.a({ href: undefined }, ["<"]);
		this.nextLink = h.a({ href: undefined }, [">"]);
		this.dom = h.span({}, [
			this.prevLink,
			" ",
			this.nextLink
		]);
	}

	setOnPageChange(cb: (posts: IntraclinicPost[]) => void){
		this.onPageChange = cb;
	}

	triggerPageChange(): void {
		
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
	private navs: DefaultNav[] = [];
	private onPageChange: (posts: IntraclinicPost[]) => void = (_) => {};

	constructor(){

	}

	createNav(): HTMLElement {
		let nav = new DefaultNav();
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

	private updateTotalNumberOfPosts(nPosts: number) {
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

	private getCurrentOffset(): number {
		return (this.currentPage - 1) * this.postsPerPage;
	}

	private getPostsperPage(): number {
		return this.postsPerPage;
	}

	setOnPageChange(cb: (posts: IntraclinicPost[]) => void){
		this.onPageChange = cb;
	}

	async triggerPageChange() {
		let posts = await service.listIntraclinicPosts(
			this.getCurrentOffset(), 
			this.getPostsperPage()
		);
		this.onPageChange(posts);
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
			this.triggerPageChange();
		}
	}

	private gotoNext(){
		if( this.currentPage < this.nPages ){
			this.currentPage += 1;
			this.updateNavs();
			this.triggerPageChange();
		}
	}
}