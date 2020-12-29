const electron = require('electron');
const { BrowserWindow, ipcMain, webContents, app } = electron;

const path = require('path');
const fs = require('fs');

const gotTheLock = app.requestSingleInstanceLock();
let mainWindow, subWindow;
let initPath;

app.allowRendererProcessReuse = true;
if (!gotTheLock) {
	app.quit();
	app.exit();
} else {
	app.whenReady().then(() => {
		initPath = path.join(app.getPath('userData'), 'init.json');

		try {
			data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
		} catch (e) {}

		main_window();
		if (BrowserWindow.getAllWindows().length !== 0) {
			ipcMain.on('win_maximize', (event) => {
				event.sender.getOwnerBrowserWindow().maximize();
			});
			ipcMain.on('win_unmaximize', (event) => {
				event.sender.getOwnerBrowserWindow().unmaximize();
			});
			ipcMain.on('win_minimize', (event) => {
				event.sender.getOwnerBrowserWindow().minimize();
			});
			ipcMain.on('url', (event, url) => {
				sub_window(url);
			});
		}

		app.on('activate', function () {
			if (BrowserWindow.getAllWindows().length === 0) main_window();
		});
	});
	app.on('second-instance', function () {
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			} else if (!mainWindow.isVisible()) {
				mainWindow.show();
			}
			mainWindow.focus();
		} else {
			if (subWindow) {
				if (subWindow.isMinimized()) {
					subWindow.restore();
				} else if (!subWindow.isVisible()) {
					subWindow.show();
				}
				subWindow.focus();
			}
		}
	});
	app.on('window-all-closed', () => {
		// data = {
		// 	bounds: mainWindow.getBounds(),
		// };
		// fs.writeFileSync(initPath, JSON.stringify(data));
		// app.quit();
		if (process.platform !== 'darwin') app.quit();
	});
}
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
	mainWindow.loadURL('file://' + __dirname + '/index.html', {
		postData: {
			test: 'test',
		},
	});
	mainWindow.on('close', (event) => {
		mainWindow = false;
	});
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
