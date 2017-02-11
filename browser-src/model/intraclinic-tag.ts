
export class IntraclinicTag {
	id: number;
	name: string;
}

export function jsonToIntraclinicTag(src: any): IntraclinicTag {
	let tag = new IntraclinicTag();
	tag.id = src.id;
	tag.name = src.name;
	return tag;
}