const electron = require('electron');
const { BrowserWindow, ipcMain, app, globalShortcut, Tray, Menu } = electron;
const path = require('path');
const fs = require('fs');

const gotTheLock = app.requestSingleInstanceLock();
let mainWindow, subWindow;
let initPath;
let tray;
app.allowRendererProcessReuse = true;
if (!gotTheLock) {
	app.quit();
	app.exit();
} else {
	app.whenReady().then(async () => {
		initPath = path.join(app.getPath('userData'), 'init.json');

		try {
			data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
		} catch (e) {}

		await main_window();
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
			ipcMain.on('reload', (event, args) => {
				event.sender.getOwnerBrowserWindow().send('reload');
			});
		}

		app.on('activate', function () {
			if (BrowserWindow.getAllWindows().length === 0) main_window();
		});

		app.on('browser-window-focus', function () {
			globalShortcut.register('CommandOrControl+W', () => {
				if (mainWindow) {
					mainWindow.hide();
				} else {
					if (subWindow) {
						subWindow.hide();
					}
				}
			});
			globalShortcut.register('CommandOrControl+R', () => {});
			globalShortcut.register('F5', () => {});
		});
		app.on('browser-window-blur', function () {
			globalShortcut.unregister('CommandOrControl+W');
			globalShortcut.unregister('CommandOrControl+R');
			globalShortcut.unregister('F5');
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
async function main_window() {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
		titleBarStyle: 'hidden',
		frame: false,
		backgroundColor: '#fff',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webviewTag: true,
			enableRemoteModule: true,
		},
	});
	createTray();
	mainWindow.loadURL('file://' + __dirname + '/index.html', {
		postData: {
			test: 'test',
		},
	});
	mainWindow.on('close', () => {
		mainWindow = null;
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
			contextIsolation: false,
			webviewTag: true,
			enableRemoteModule: true,
		},
	});
	subWindow.loadURL('file://' + __dirname + '/index.html');
	subWindow.webContents.on('did-finish-load', () => {
		subWindow.webContents.send('url', url);
	});
}
function createTray() {
	// Tray 생성
	tray = new Tray(path.join(__dirname, 'assets/icons/win/icon.ico'));

	tray.on('double-click', () => {
		if (mainWindow) {
			mainWindow.show();
			mainWindow.focus();
		} else {
			if (subWindow) {
				subWindow.show();
				subWindow.focus();
			}
		}
	});

	// Tray 메뉴
	const contextMenu = Menu.buildFromTemplate([
		{
			label: '종료',
			click: function () {
				if (mainWindow) {
					mainWindow.close();
					if (subWindow) {
						subWindow.close();
					}
				} else {
					if (subWindow) {
						subWindow.close();
					}
				}
				app.quit();
				app.exit();
			},
		},
	]);
	tray.setContextMenu(contextMenu);
}
