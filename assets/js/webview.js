window.onresize = doLayout;
let screen = true;
const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const winScreenX = window.screenX;
const winScreenY = window.screenY;
let progress = 0;
let progress_bar = 0;
onload = () => {
	doLayout();
	sub_window();
	// Topbar functions
	setting();
};

function doLayout() {
	let webview = document.querySelector('webview');
	// let windowWidth = document.documentElement.clientWidth;
	// let windowHeight = document.documentElement.clientHeight;
	let controlsHeight = getControlsHeight();
	// let webviewHeight = windowHeight - controlsHeight;
	// webview.style.width = windowWidth + 'px';
	// webview.style.height = webviewHeight + 'px';
}
