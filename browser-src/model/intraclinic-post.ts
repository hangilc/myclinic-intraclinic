export class IntraclinicPost {
	id: number;
	content: string;
	createdAt: string;
}

export function jsonToIntraclinicPost(src: any): IntraclinicPost {
	let post = new IntraclinicPost();
	post.id = src.id;
	post.content = src.content;
	post.createdAt = src.created_at;
	return post;
}