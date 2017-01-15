export function createElement<T extends HTMLElement>(tag: string, attrs: any, 
		children?: (HTMLElement|string)[]): T {
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
	if( children ){
		children.forEach(function(n){
			if( typeof n === "string" ){
				e.appendChild(document.createTextNode(<string>n));
			} else {
				e.appendChild(<Node>n);
			}
		});
	}
	return e;
}

export function createElementFn<T extends HTMLElement>(fn: (e:T) => void, 
		tag: string, attrs: any, children?: (HTMLElement|string)[]): T {
	let e = createElement<T>(tag, attrs, children);
	fn(e);
	return e;
}

export namespace h {
	function makeCreator<T extends HTMLElement>(tag: string): (attrs: any, 
		children?: (HTMLElement|string)[]) => T {
		return function(attrs: any, children?: (HTMLElement|string)[]): T{
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

	export function form(attrs: any, children?: (HTMLElement|string)[]): HTMLFormElement{
		if( !("onSubmit" in attrs) ){
			attrs.onSubmit = "return false";
		}
		return createElement<HTMLFormElement>("form", attrs, children);
	}

	export function a(attrs: any, children?: (HTMLElement|string)[]): HTMLElement{
		if( !("href" in attrs) ){
			attrs.href = "javascript:void(0)"
		}
		return createElement<HTMLElement>("a", attrs, children);
	}
}

/**
export namespace f {
	function makeCreator<T extends HTMLElement>(tag: string): 
		(fn: (e:T) => void, attrs: any, children?: (HTMLElement|string)[]) => T {
		return function(fn: (e:T) => void,
				attrs: any, children?: (HTMLElement|string)[]): T{
			return createElementFn<T>(fn, tag, attrs, children);
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

	export function form(fn: (e:HTMLFormElement) => void,
			attrs: any, children?: (HTMLElement|string)[]): HTMLFormElement{
		if( !("onSubmit" in attrs) ){
			attrs.onSubmit = "return false";
		}
		return createElementFn<HTMLFormElement>(fn, "form", attrs, children);
	}

	export function a(fn: (e:HTMLElement) => void,
			attrs: any, children?: (HTMLElement|string)[]): HTMLElement{
		if( !("href" in attrs) ){
			attrs.href = "javascript:void(0)"
		}
		return createElementFn<HTMLElement>(fn, "a", attrs, children);
	}
}

export function range(from: number, to: number): number[] {
	let r: number[] = [];
	for(let i=from;i<=to;i++){
		r.push(i);
	}
	return r;
}

export function interpose(sep: any, arr: any[]): any[] {
	let r: any[] = [];
	for(let i=0;i<arr.length;i++){
		r.push(arr[i]);
		if( i !== (arr.length-1) ){
			r.push(sep);
		}
	}
	return r;
}

*/