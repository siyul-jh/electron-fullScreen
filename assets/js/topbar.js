const { remote, ipcRenderer, shell } = require('electron');

function sub_window() {
	ipcRenderer.on('url', (event, message) => {
		let webview = document.querySelector('webview');
		webview.src = message;
	});
}

function navigateTo(url) {
	document.querySelector('webview').src = url;
}
function getControlsHeight() {
	let controls = document.querySelector('#controls');
	if (controls) {
		return controls.offsetHeight;
	}
	return 0;
}
function setting() {
	document.querySelector('#youtube').addEventListener('click', youtube); // 이벤트 연결
	document.querySelector('#inflearn').addEventListener('click', inflearn); // 이벤트 연결
	document.querySelector('.screen.min').addEventListener('click', win_minimize); // 이벤트 연결
	document.querySelector('.screen.max').addEventListener('click', win_maximize); // 이벤트 연결
	document.querySelector('.button-close').addEventListener('click', win_close); // 이벤트 연결
	document.querySelector('#prev').addEventListener('click', prev); // 이벤트 연결
	document.querySelector('#next').addEventListener('click', next); // 이벤트 연결
	document.querySelector('#url').addEventListener('focus', select); // 이벤트 연결
	document.querySelector('#url').addEventListener('keyup', url); // 이벤트 연결

	// webview event
	document.querySelector('webview').addEventListener('did-start-loading', () => {
		document.querySelector('.loading').classList.add('active');
		document.querySelector('.indicator').innerText = 'Loading...';
	});
	document.querySelector('webview').addEventListener('did-stop-loading', () => {
		document.querySelector('.loading').classList.remove('active');
		document.querySelector('.indicator').innerText = '';
	});
	document.querySelector('webview').addEventListener('did-finish-load', () => {
		if (document.querySelector('webview').canGoForward()) {
			document.querySelector('#next').classList.add('active');
		} else {
			document.querySelector('#next').classList.remove('active');
		}
		if (document.querySelector('webview').canGoBack()) {
			document.querySelector('#prev').classList.add('active');
		} else {
			document.querySelector('#prev').classList.remove('active');
		}
		let url = document.querySelector('#url');
		let webview = document.querySelector('webview');
		let title = document.querySelector('#title');
		url.value = webview.src;
		title.innerHTML = webview.getTitle();
	});
	document.querySelector('webview').addEventListener('new-window', async (e) => {
		e.preventDefault();
		const protocol = new URL(e.url).protocol;
		if (protocol === 'http:' || protocol === 'https:') {
			ipcRenderer.send('url', e.url);
		}
	});
}
function youtube() {
	let youtube = document.querySelector('#youtube').getAttribute('data-url');
	navigateTo(youtube);
}
function inflearn() {
	let inflearn = document.querySelector('#inflearn').getAttribute('data-url');
	navigateTo(inflearn);
}
function win_minimize() {
	ipcRenderer.send('win_minimize');
}
function win_maximize() {
	if (screen) {
		ipcRenderer.send('win_maximize');
	} else {
		ipcRenderer.send('win_unmaximize');
	}
	screen = !screen;
}
function win_close() {
	window.close();
}
function prev() {
	document.querySelector('webview').goBack();
}
function next() {
	document.querySelector('webview').goForward();
}
function select() {
	let url = document.querySelector('#url');
	url.select();
}
function url() {
	let url = document.querySelector('#url');
	if (event.keyCode == 13) {
		if (urlCheck(url.value)) {
			const new_value = url.value.replace(/^(http[s]?:\/\/){0,1}(www\.){0,1}[.]{0,1}/, '');
			new_url = 'http://' + new_value;
		} else {
			new_url = 'http://google.com/search?q=' + url.value;
		}
		navigateTo(new_url);
		url.blur();
	}
}
function urlCheck(value) {
	var pattern = new RegExp(
		'^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$',
		'i'
	); // fragment locator
	return !!pattern.test(value);
}
