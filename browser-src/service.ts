import { request, arrayConverter } from "./request";
import { IntraclinicPost, jsonToIntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment, jsonToIntraclinicComment } from "./model/intraclinic-comment";

function toNumber(src: any): number {
	return +src;
}

function toText(src: any): string {
	return "" + src;
}

let PostArrayConverter = arrayConverter(jsonToIntraclinicPost);
let CommentArrayConverter = arrayConverter(jsonToIntraclinicComment);

export async function countIntraclinicPosts(): Promise<number> {
	return request("/service", { _q: "count_intra_clinic_posts" }, "GET", toNumber);
}

export async function listIntraclinicPosts(offset: number, n: number): Promise<IntraclinicPost[]> {
	return request("/service?_q=list_intra_clinic_posts", {
		offset: offset,
		n: n
	}, "GET", PostArrayConverter);
}

export async function getIntraclinicPost(id: number): Promise<IntraclinicPost> {
	return request("/service?_q=get_intra_clinic_post", {
		id: id
	}, "GET", jsonToIntraclinicPost);
}

export async function listIntraclinicComment(postId: number): Promise<IntraclinicComment[]> {
	return request("/service?_q=list_intra_clinic_comments", {
		post_id: postId
	}, "GET", CommentArrayConverter);
}

export async function enterIntraclinicPost(content: string, createdAt: string): Promise<number> {
	return request("/service?_q=enter_intra_clinic_post", {
		content: content,
		created_at: createdAt
	}, "POST", toNumber);
}

export async function updateIntraclinicPost(id: number, content: string): Promise<string> {
	return request("/service?_q=update_intra_clinic_post", {
		id: id,
		content: content
	}, "POST", toString);
}

export async function deleteIntraclinicPost(id: number): Promise<string> {
	return request("/service?_q=delete_intra_clinic_post", {
		id: id
	}, "POST", toString);
}

export async function enterIntraclinicComment(name: string, content: string, postId: number, createdAt: string): Promise<number> {
	return request("/service?_q=enter_intra_clinic_comment", {
		name: name,
		content: content,
		post_id: postId,
		created_at: createdAt
	}, "POST", toNumber);
}