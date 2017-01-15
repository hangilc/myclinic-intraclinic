"use strict";
const typed_dom_1 = require("./typed-dom");
const myclinic_modal_1 = require("./myclinic-modal");
let arg = new myclinic_modal_1.OpenModalArg()
    .setTitle("ログイン")
    .setInit((content, close) => {
    content.appendChild(typed_dom_1.h.div({}, [
        "CONTENT"
    ]));
});
myclinic_modal_1.openModal(arg);
