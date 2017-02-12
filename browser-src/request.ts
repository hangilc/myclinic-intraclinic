import * as $ from "jquery";

export interface Converter<T>{
	(src:any): T
}

export function arrayConverter<T>(c: Converter<T>): Converter<T[]> {
	return function(src: any[]): T[] {
		return src.map(c);
	}
}

export function request<T>(url: string, data: Object, 
	method: string, cvtor: Converter<T>){
	if( method === "POST" && typeof data !== "string" ){
		data = JSON.stringify(data);
	}
	return new Promise<T>(function(resolve, reject){
		$.ajax({
			url: url,
			type: method,
			data: data,
			dataType: "json",
			contentType: "application/json",
			timeout: 15000,
			success: function(result){
				try {
					let obj = cvtor(result);
					resolve(obj);
				} catch(ex){
					reject(ex);
				}
			},
			error: function(xhr, status, ex){
				reject(JSON.stringify({xhr: xhr, status: status, exception: ex}));
			}
		})
	});
}
