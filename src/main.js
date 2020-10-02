import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';

// Add auto udpate
require('update-electron-app')();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createWindow = async () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 650,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hiddenInset'
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    if (isDevMode) {
        await installExtension(REACT_DEVELOPER_TOOLS);
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    const template = [
        {
            label: 'File',
            submenu: [{
                label: 'New File',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    mainWindow.webContents.send('new');
                }
            }]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload this page',
                    accelerator: 'CmdOrCtrl+R',
                    role: 'reload'
                },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        require('electron').shell.openExternal('https://google.com');
                    }
                },
                {
                    label: 'Test',
                    click() {
                        require('electron').shell.openExternal('https://google.com');
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            // label: app.getName(),
            label: 'TextEditor',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });

        // Edit menu
        template[1].submenu.push(
            { type: 'separator' },
            {
                label: 'Speech',
                submenu: [
                    { role: 'startspeaking' },
                    { role: 'stopspeaking' }
                ]
            }
        );

        // Window menu
        // template[3].submenu = [
        //     { role: 'close' },
        //     { role: 'minimize' },
        //     { role: 'zoom' },
        //     { type: 'separator' },
        //     { role: 'front' }
        // ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
// const { webFrame } = require('electron');
// const spellChecker = require('spellchecker');
// webFrame.setSpellCheckProvider('en-US', {
//     spellCheck(words, callback) {
//         setTimeout(() => {
//             const spellchecker = require('spellchecker');
//             const misspelled = words.filter(x => spellchecker.isMisspelled(x));
//             callback(misspelled);
//         }, 0);
//     }
// });
