const { remote, ipcRenderer, shell, session } = require('electron');

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
function frame(state) {
	var elem = document.getElementById('bar');
	var id = setInterval(bar, 100, state);
	function bar(state) {
		if (state == 'ready') {
			elem.style.animation = 'none';
			if (progress_bar < 100) {
				progress_bar++;
				elem.style.width = progress_bar + '%';
			}
			if (progress_bar == 15) {
				clearTimeout(id);
			}
		} else if (state == 'finish') {
			elem.style.animation = 'load 100ms normal forwards';
			progress_bar = 100;
			elem.style.width = progress_bar + '%';
			clearTimeout(id);
			setTimeout(() => {
				document.getElementById('progress').style.zIndex = '0';
			}, 250);
		}
	}
	// clearInterval();
}

function setting() {
	let url = document.querySelector('#url');
	let webview = document.querySelector('webview');
	let title = document.querySelector('#title');

	document.querySelector('#youtube').addEventListener('click', youtube); // 이벤트 연결
	document.querySelector('#inflearn').addEventListener('click', inflearn); // 이벤트 연결
	document.querySelector('.screen.min').addEventListener('click', win_minimize); // 이벤트 연결
	document.querySelector('.screen.max').addEventListener('click', win_maximize); // 이벤트 연결
	document.querySelector('.button-close').addEventListener('click', win_close); // 이벤트 연결
	document.querySelector('#prev').addEventListener('click', prev); // 이벤트 연결
	document.querySelector('#next').addEventListener('click', next); // 이벤트 연결
	document.querySelector('#reload').addEventListener('click', reload); // 이벤트 연결
	document.querySelector('#url').addEventListener('focus', select); // 이벤트 연결
	document.querySelector('#url').addEventListener('keydown', urlLink); // 이벤트 연결
	// webview event

	document.querySelector('webview').addEventListener('dom-ready', () => {
		document.getElementById('progress').style.zIndex = '1';
		webview.classList.add('blur');
		url.classList.add('blur');
		title.classList.add('blur');
		if (progress == 0) {
			progress = 1;
			progress_bar = 0;
			frame('ready');
		}
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
		webview.classList.remove('blur');
		url.classList.remove('blur');
		title.classList.remove('blur');

		if (progress != 0) {
			progress = 0;
			frame('finish');
		}

		sessionStorage.setItem('url', webview.src);
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
	document.querySelector('webview').addEventListener('enter-html-full-screen', (e) => {
		document.querySelector('webview').classList.add('full');
	});
	document.querySelector('webview').addEventListener('leave-html-full-screen', (e) => {
		document.querySelector('webview').classList.remove('full');
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
function reload() {
	document.querySelector('webview').reloadIgnoringCache();
}
function select() {
	let url = document.querySelector('#url');
	url.select();
}
function urlLink() {
	let url = document.querySelector('#url');
	let webview = document.querySelector('webview');
	let title = document.querySelector('#title');
	let loading = document.querySelector('.loading');
	if (event.keyCode == 13) {
		if (urlCheck(url.value)) {
			const new_value = url.value.replace(/^(http[s]?:\/\/){0,1}(www\.){0,1}[.]{0,1}/, '');
			new_url = 'http://' + new_value;
		} else {
			new_url = 'http://google.com/search?q=' + url.value;
		}
		webview.classList.add('blur');
		loading.classList.add('active');
		url.classList.add('blur');
		title.classList.add('blur');
		navigateTo(new_url);
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
