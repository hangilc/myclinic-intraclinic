export function createElement<T extends HTMLElement>(tag: string, attrs: any, 
		children: (HTMLElement|string|null)[]): T {
	let e: T = <T>document.createElement(tag);
	for(let key in attrs){
		let val = attrs[key];
		if( key === "style" ){
			if( typeof val === "string" ){
				e.style.cssText = val;
			} else {
				for(let cssKey in val){
					e.style[cssKey] = val[cssKey];
				}
			}
		} else {
			e.setAttribute(key, val);
		}
	}
	appendToElement(e, children);
	return e;
}

export function createElementFn<T extends HTMLElement>(fn: (e:T) => void, 
		tag: string, attrs: any, children: (HTMLElement|string|null)[]): T {
	let e = createElement<T>(tag, attrs, children);
	fn(e);
	return e;
}

export namespace h {
	function makeCreator<T extends HTMLElement>(tag: string): (attrs: any, 
		children: (HTMLElement|string|null)[]) => T {
		return function(attrs: any, children: (HTMLElement|string|null)[]): T{
			return createElement<T>(tag, attrs, children);
		}
	}

	export let div = makeCreator<HTMLElement>("div");
	export let h1 = makeCreator<HTMLElement>("h1");
	export let h2 = makeCreator<HTMLElement>("h2");
	export let h3 = makeCreator<HTMLElement>("h3");
	export let input = makeCreator<HTMLInputElement>("input");
	export let button = makeCreator<HTMLElement>("button");
	export let table = makeCreator<HTMLTableElement>("table");
	export let tbody = makeCreator<HTMLElement>("tbody");
	export let tr = makeCreator<HTMLElement>("tr");
	export let td = makeCreator<HTMLElement>("td");
	export let br = makeCreator<HTMLElement>("br");
	export let p = makeCreator<HTMLElement>("p");
	export let select = makeCreator<HTMLSelectElement>("select");
	export let option = makeCreator<HTMLOptionElement>("option");
	export let span = makeCreator<HTMLElement>("span");
	export let textarea = makeCreator<HTMLTextAreaElement>("textarea");

	export function form(attrs: any, children: (HTMLElement|string|null)[]): HTMLFormElement{
		if( !("onSubmit" in attrs) ){
			attrs.onSubmit = "return false";
		}
		return createElement<HTMLFormElement>("form", attrs, children);
	}

	export function a(attrs: any, children: (HTMLElement|string|null)[]): HTMLAnchorElement{
		if( !("href" in attrs) ){
			attrs.href = "javascript:void(0)"
		} else if( attrs.href === undefined ){
			delete attrs.href;
		}
		return createElement<HTMLAnchorElement>("a", attrs, children);
	}
}

export function appendToElement(element: HTMLElement, children: (HTMLElement|string|null)[]){
	children.forEach(function(n){
		if( typeof n === "string" ){
			element.appendChild(document.createTextNode(<string>n));
		} else if( n instanceof HTMLElement ){
			element.appendChild(<HTMLElement>n);
		}
	});
}

export function removeElement(element: HTMLElement){
	let parent = element.parentNode;
	if( parent !== null ){
		parent.removeChild(element);
	}
}
