export class IntraclinicComment {
	id: number;
	name: string;
	content: string;
	postId: number;
	createdAt: string;
}

export function jsonToIntraclinicComment(src: any): IntraclinicComment {
	let com = new IntraclinicComment();
	com.id = src.id;
	com.name = src.name;
	com.content = src.content;
	com.postId = src.post_id;
	com.createdAt = src.created_at;
	return com;
}