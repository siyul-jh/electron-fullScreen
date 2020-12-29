const electron = require('electron');
const app = electron.app;
const { BrowserWindow, ipcMain } = electron;

const path = require('path');
const fs = require('fs');

const { Menu } = require('electron');

let mainWindow, subWindow;
let initPath;

app.allowRendererProcessReuse = true;
app.on('ready', () => {
	initPath = path.join(app.getPath('userData'), 'init.json');

	try {
		data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
	} catch (e) {}
	main_window();
	ipcMain.on('win_maximize', () => {
		mainWindow.maximize();
	});
	ipcMain.on('win_unmaximize', () => {
		mainWindow.unmaximize();
	});
	ipcMain.on('win_minimize', () => {
		mainWindow.minimize();
	});
	ipcMain.on('url', (event, url) => {
		sub_window(url);
	});
});

app.on('window-all-closed', () => {
	// data = {
	// 	bounds: mainWindow.getBounds(),
	// };
	// fs.writeFileSync(initPath, JSON.stringify(data));
	// app.quit();
	if (process.platform !== 'darwin') app.quit();
});

function main_window() {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
		titleBarStyle: 'hidden',
		frame: false,
		backgroundColor: '#fff',
		webPreferences: {
			nodeIntegration: true,
			webviewTag: true,
			enableRemoteModule: true,
		},
	});
	mainWindow.loadURL('file://' + __dirname + '/index.html');
}
function sub_window(url) {
	subWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
		titleBarStyle: 'hidden',
		frame: false,
		backgroundColor: '#fff',
		webPreferences: {
			nodeIntegration: true,
			webviewTag: true,
			enableRemoteModule: true,
		},
	});
	subWindow.loadURL('file://' + __dirname + '/index.html');
	subWindow.webContents.on('did-finish-load', () => {
		subWindow.webContents.send('url', url);
	});
}
