import { request, arrayConverter } from "./request";
import { IntraclinicPost, jsonToIntraclinicPost } from "./model/intraclinic-post";
import { IntraclinicComment, jsonToIntraclinicComment } from "./model/intraclinic-comment";
import { IntraclinicTag, jsonToIntraclinicTag } from "./model/intraclinic-tag";

function toNumber(src: any): number {
	return +src;
}

function toText(src: any): string {
	return "" + src;
}

function toBoolean(src: any): boolean {
	return src === true;
}

let PostArrayConverter = arrayConverter(jsonToIntraclinicPost);
let CommentArrayConverter = arrayConverter(jsonToIntraclinicComment);
let TagArrayConverter = arrayConverter(jsonToIntraclinicTag);

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

export async function listIntraclinicComments(postId: number): Promise<IntraclinicComment[]> {
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

export async function countIntraclinicOlderThan(date: string): Promise<number> {
	return request("/service?_q=count_intra_clinic_posts_older_than", { date: date }, "GET", toNumber);
}

export async function countIntraclinicSearch(text: string): Promise<number> {
	return request("/service?_q=count_intra_clinic_search", { text: text }, "GET", toNumber);
}

export async function searchIntraclinic(text: string, offset: number, n: number): Promise<IntraclinicPost[]> {
	return request("/service?_q=search_intra_clinic", { text: text, offset: offset, n: n }, "GET", PostArrayConverter);
}

export async function createIntraclinicTag(name: string): Promise<number> {
	return request("/service?_q=create_intra_clinic_tag", { name: name }, "POST", toNumber);
}

export async function getIntraclinicTag(id: number): Promise<IntraclinicTag> {
	return request("/service?_q=get_intra_clinic_tag", { id: id }, "GET", jsonToIntraclinicTag);
}

export async function listIntraclinicTag(): Promise<IntraclinicTag[]> {
	return request("/service?_q=list_intra_clinic_tag", {}, "GET", TagArrayConverter);
}

export async function renameIntraclinicTag(id: number, name: string): Promise<boolean> {
	return request("/service?_q=rename_intra_clinic_tag", { id: id, name: name }, "POST", toBoolean);
}

export async function deleteIntraclinicTag(id: number): Promise<boolean> {
	return request("/service?_q=delete_intra_clinic_tag", { id: id }, "POST", toBoolean);
}

export async function addIntraclinicPostToTag(tagId: number, postId: number): Promise<boolean> {
	return request("/service?_q=add_intra_clinic_post_to_tag", { tag_id: tagId, post_id: postId }, "POST", toBoolean);
}

export async function removeIntraclinicPostFromTag(tagId: number, postId: number): Promise<boolean> {
	return request("/service?_q=remove_intra_clinic_post_from_tag", { tag_id: tagId, post_id: postId }, "POST", toBoolean);
}

export async function countIntraclinicTagPost(tagId: number): Promise<number> {
	return request("/service?_q=count_intra_clinic_tag_post", { tag_id: tagId }, "GET", toNumber);
}

export async function listIntraclinicTagPost(tagId: number, offset: number, n: number): Promise<IntraclinicPost[]> {
	return request("/service?_q=list_intra_clinic_tag_post", 
		{ tag_id: tagId, offset: offset, n: n }, "GET", PostArrayConverter);
}