import { h } from "./typed-dom";

class ModalDialog {
	private screenZIndex: number = 10;
	private screenOpacity: number = 0.5;
	private dialogZIndex: number = 11;
	private titleLabel: string;
	private onClose: () => boolean = () => true;
	private screen: HTMLElement | null = null;
	private dialog: HTMLElement | null = null;
	private content: HTMLElement | null = null;
	private handle: HTMLElement | null = null;

	constructor(title: string = "Untitled"){
		this.titleLabel = title;
		this.screen = this.createScreen();
		this.dialog = this.createDialog();
		if( this.dialog !== null ){
			if( this.handle !== null ){
				this.bindHandle(this.handle, this.dialog);
			}
		}
	}

	setOnClose(fn: () => boolean): void {
		this.onClose = fn;
	}

	open() {
		if( this.screen !== null ){
			if( this.dialog !== null ){
				document.body.appendChild(this.screen);
				document.body.appendChild(this.dialog);
			}
		}
	}

	close() {
		if( this.screen ){
			if( this.screen.parentNode !== null ){
				this.screen.parentNode.removeChild(this.screen);
			}
		}
		if( this.dialog ){
			if( this.dialog.parentNode !== null ){
				this.dialog.parentNode.removeChild(this.dialog);
			}
		}
	}

	getContent(): HTMLElement | null {
		return this.content;
	}

	reposition(): void {
		let dialog = this.dialog;
		if( dialog !== null ){
			let space = window.innerWidth - dialog.offsetWidth;
			if( space > 0 ){
				dialog.style.left = Math.floor(space / 2) + "px";
			}
		}
	}

	private createScreen(): HTMLElement {
		return h.div({
			style: {
			    position:"fixed",
			    backgroundColor:"#999",
			    width:"100%",
			    height:"100%",
			    left:0,
			    top:0,
			    opacity: this.screenOpacity,
			    filter:"alpha(opacity=" + Math.round(this.screenOpacity*100) + ")",
			    zIndex: this.screenZIndex,
			}
		}, []);
	}

	private createDialog(): HTMLElement {
		return h.div({
			style: {
			    position:"absolute",
			    left:"100px",
			    top:"50px",
			    padding:"10px",
			    border:"2px solid gray",
			    backgroundColor:"white",
			    opacity:1.0,
			    filter:"alpha(opacity=100)",
			    zIndex: this.dialogZIndex,
			    overflow: "auto"
			}
		}, [
			this.createHeader(),
			this.createContent()
		])
	}

	private createHeader(): HTMLElement {
		let header = h.table({
			width: "100%",
			cellpadding: "0",
			cellspacing: "0",
			style: {
				margin: 0,
				padding: 0
			}
		}, [
			h.tbody({}, [
				h.tr({}, [
					h.td({
						width: "*",
						style: {
							"user-select": "none",
							"-moz-user-select": "none"
						}
					},[this.createTitle()]),
					h.td({
						width: "auto",
						style: {
						    width:"16px",
						    verticalAlign:"middle"
						}
					}, [this.createCloseBox()])
				])
			])
		]);
		this.handle = header;
		return header;
	}

	private createTitle(): HTMLElement {
		return h.div({}, [
			h.div({
				style: {
				    cursor:"move",
				    backgroundColor:"#ccc",
				    fontWeight:"bold",
				    padding:"6px 4px 4px 4px"
				}
			}, [this.titleLabel])
		])
	}

	private createCloseBox(): HTMLElement {
		let anchor = h.a({
			style: {
			    fontSize:"13px",
			    fontWeight:"bold",
			    margin:"4px 0 4px 4px",
			    padding:0,
			    textDecoration:"none",
			    color:"#333"
			}
		}, ["×"]);
		anchor.addEventListener("click", event => {
			let executeClose: boolean = this.onClose();
			if( executeClose !== false ){
				this.close();
			}
		});
		return anchor;
	}

	private createContent(): HTMLElement {
		this.content = h.div({
			style: {
				"margin-top": "10px"
			}
		}, []);
		return this.content;
	}

	private bindHandle(handle: HTMLElement, dialog: HTMLElement): void {
		handle.addEventListener("mousedown", event => {
			event.preventDefault();
			event.stopPropagation();
			let startX = event.pageX;
			let startY = event.pageY;
			let offsetX = dialog.offsetLeft;
			let offsetY = dialog.offsetTop;
			document.addEventListener("mousemove", mouseMoveHandler);
			document.addEventListener("mouseup", event => {
				document.removeEventListener("mousemove", mouseMoveHandler);
			})

			function mouseMoveHandler(event: MouseEvent){
				var windowWidth = window.innerWidth;
				var windowHeight = window.innerHeight;
				var dialogWidth = dialog.offsetWidth;
				var dialogHeight = dialog.offsetHeight;
				var currX = event.pageX;
				var currY = event.pageY;
				var newLeft = offsetX + (currX - startX);
				if( newLeft + dialogWidth > windowWidth ){
					newLeft = windowWidth - dialogWidth;
				}
				if( newLeft < 0 ){
					newLeft = 0;
				}
				var newTop = offsetY + (currY - startY);
				if( newTop + dialogHeight > windowHeight ){
					newTop = windowHeight - dialogHeight;
				}
				if( newTop < 0 ){
					newTop = 0;
				}
				dialog.style.left =  newLeft + "px";
				dialog.style.top = newTop + "px";
			}
		});
	}
}

export class OpenModalArg {
	title: string = "Test";
	init: (content: HTMLElement, close: () => void) => void = () => {};
	onCloseClick: () => boolean = () => true; // return false if you don't want to close

	setTitle(title: string): this {
		this.title = title;
		return this;
	}

	setInit(fn: (content:HTMLElement, close: () => void) => void) : this {
		this.init = fn;
		return this;
	}

	setOnCloseClick(fn: () => boolean): this {
		this.onCloseClick = fn;
		return this;
	}
}

export function openModal(arg: OpenModalArg): void {
	let dialog = new ModalDialog(arg.title);
	let content = dialog.getContent();
	if( content !== null ){
		arg.init(content, () => {
			dialog.close()
		})
	}
	dialog.open();
	dialog.reposition();
}

