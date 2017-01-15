import { h } from "./typed-dom";

import { OpenModalArg, openModal } from "./myclinic-modal";

let arg = new OpenModalArg()
	.setTitle("ログイン")
	.setInit((content: HTMLElement, close: () => void) => {
		content.appendChild(h.div({}, [
			"CONTENT"
		]));
	});

openModal(arg);

