"use strict";

(function(exports){

function setAttributes(e, map){
	for(var key in map){
	e.setAttribute(key, map[key]);
	}
}

function setStyles(e, map){
	for(var key in map){
		e.style[key] = map[key];
	}
}

function getOpt(opts, key, defaultValue){
	if( opts && key in opts ){
		return opts[key];
	} else {
		return defaultValue;
	}
}

function createScreen(zIndex, opacity){
	var screen = document.createElement("div");
	setStyles(screen, {
	    position:"fixed",
	    backgroundColor:"#999",
	    width:"100%",
	    height:"100%",
	    left:0,
	    top:0,
	    opacity: opacity,
	    filter:"alpha(opacity=" + Math.round(opacity*100) + ")",
	    zIndex: zIndex,
	    //display:"none"
	})
	return screen;
}

function createDialog(zIndex){
	var dialog = document.createElement("div");
	setStyles(dialog, {
	    //position:"absolute",
	    position:"absolute",
	    left:"100px",
	    top:"50px",
	    padding:"10px",
	    border:"2px solid gray",
	    backgroundColor:"white",
	    opacity:1.0,
	    filter:"alpha(opacity=100)",
	    zIndex: zIndex,
	    overflow: "auto"
	})
	return dialog;
}

function Header(title){
	var header = document.createElement("table");
	setAttributes(header, {
		width: "100%",
		cellpadding: "0",
		cellspacing: "0"
	});
	setStyles(header, {
		margin: "0",
		padding: "0"
	});
	var tbody = document.createElement("tbody");
	header.appendChild(tbody);
	var tr = document.createElement("tr");
	tbody.appendChild(tr);
	var titleDom = document.createElement("td");
	titleDom.setAttribute("width", "*");
	titleDom.appendChild(createTitle(title));
	tr.appendChild(titleDom);
	var td = document.createElement("td");
	td.setAttribute("width", "auto");
	setStyles(td, {
	    width:"16px",
	    verticalAlign:"middle"
	});
	var closeBox = createCloseBox();
	td.appendChild(closeBox);
	tr.appendChild(td);
	return {
		dom: header,
		handle: titleDom,
		closeBox: closeBox
	}
}

function bindHandle(handler, dialog){
	handler.addEventListener("mousedown", function(event){
		event.preventDefault();
		event.stopPropagation();
		var startX = event.pageX;
		var startY = event.pageY;
		var offsetX = dialog.offsetLeft;
		var offsetY = dialog.offsetTop;
		document.addEventListener("mousemove", mousemoveHandler);
		document.addEventListener("mouseup", function(event){
			document.removeEventListener("mousemove", mousemoveHandler);
		});

		function mousemoveHandler(event){
			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;
			var dialogWidth = dialog.offsetWidth;
			var dialogHeight = dialog.offsetHeight;
			var currX = event.pageX;
			var currY = event.pageY;
			var newLeft = offsetX + (currX - startX);
			if( newLeft + dialogWidth > windowWidth ){
				newLeft = windowWidth - dialogWidth;
			}
			if( newLeft < 0 ){
				newLeft = 0;
			}
			var newTop = offsetY + (currY - startY);
			if( newTop + dialogHeight > windowHeight ){
				newTop = windowHeight - dialogHeight;
			}
			if( newTop < 0 ){
				newTop = 0;
			}
			dialog.style.left =  newLeft + "px";
			dialog.style.top = newTop + "px";
		}
	})
}

function createTitle(titleLabel){
	var handle = document.createElement("div");
	var title = document.createElement("div");
	setStyles(title, {
	    cursor:"move",
	    backgroundColor:"#ccc",
	    fontWeight:"bold",
	    padding:"6px 4px 4px 4px"
	});
	title.appendChild(document.createTextNode(titleLabel));
	handle.appendChild(title);
	return handle;
}

function createCloseBox(){
	var closeBox = document.createElement("a");
	closeBox.setAttribute("href", "javascript:void(0)");
	setStyles(closeBox, {
	    fontSize:"13px",
	    fontWeight:"bold",
	    margin:"4px 0 4px 4px",
	    padding:0,
	    textDecoration:"none",
	    color:"#333"
	});
	closeBox.appendChild(document.createTextNode("×"));
	return closeBox;
}

function createContent(){
	var content = document.createElement("div");
	content.style.marginTop = "10px";
	return content;
}

function ModalDialog(opts){
	this.screenZIndex = getOpt(opts, "scrrenZIndex", 10);
	this.screenOpacity = getOpt(opts, "screenOpacity", 0.5);
	this.dialogZIndex = getOpt(opts, "dialogZIndex", 11);
	this.title = getOpt(opts, "title", "Untitled");
	this.onCloseClick = getOpt(opts, "onCloseClick", null);
	this.position = opts.position;
}

ModalDialog.prototype.open = function(){
	var screen = createScreen(this.screenZIndex, this.screenOpacity);
	//screen.style.display = "block";
	document.body.appendChild(screen);
	var dialog = createDialog(this.dialogZIndex);
	if( this.position ){
		dialog.style.position = this.position;
	}
	document.body.appendChild(dialog);
	var header = new Header(this.title);
	dialog.appendChild(header.dom);
	bindHandle(header.handle, dialog);
	header.closeBox.addEventListener("click", onClose.bind(this));
	var content = createContent(this.content);
	dialog.appendChild(content);
	this.screen = screen;
	this.dialog = dialog;
	this.content = content;
	this.reposition();

	function onClose(event){
		event.preventDefault();
		if( this.onCloseClick && this.onCloseClick() === false ){
			return;
		}
		this.close();
	}
};

ModalDialog.prototype.reposition = function(){
	if( !this.dialog ){
		return;
	}
	var dialog = this.dialog;
	var space = window.innerWidth - dialog.offsetWidth;
	if( space > 0 ){
		dialog.style.left = Math.floor(space / 2) + "px";
	}
}

ModalDialog.prototype.close = function(){
	document.body.removeChild(this.dialog);
	document.body.removeChild(this.screen);
}

// Example ----------------------------------------------
//
// startModal({
// 	title: "Test",
// 	init: function(content, close){
// 		var a = document.createElement("button");
// 		a.setAttribute("href", "javascript:void(0)");
// 		a.addEventListener("click", function(event){
// 			close();
// 		});
// 		a.appendChild(document.createTextNode("Close"));
// 		content.innerHTML = "Hello, world!";
// 		content.appendChild(a);
// 		console.log(this.screenZIndex);
// 	},
// 	onCloseClick: function(){
// 		console.log("close box clicked");
// 		// return false // if not to close dialog
// 	}
// });
//

exports.startModal = function(opts){
	if( !opts ){
		opts = {};
	}
	var modalDialog = new ModalDialog(opts);
	modalDialog.open({ position: opts.position });
	if( opts.init ){
		opts.init.call(modalDialog, modalDialog.content, function(){ modalDialog.close(); });
		modalDialog.reposition();
	}
}

})(typeof exports !== "undefined" ? exports : window);
