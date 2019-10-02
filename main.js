const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow, addWindow;

// Listen for the the app to be ready
app.on('ready', function() {
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true }
    });
    // Load html into window
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'mainWindow.html'),
            protocol: 'file:',
            slashes: true
        })
    );
    // Quit app when closed
    mainWindow.on('closed', function() {
        app.quit();
    });
    // Build menu  from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add shopping list item',
        webPreferences: { nodeIntegration: true }
    });
    // Load html into window
    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'addWindow.html'),
            protocol: 'file:',
            slashes: true
        })
    );
    // Garbage collection
    addWindow.on('close', function() {
        addWindow = null;
    });
}

// Catch item add
ipcMain.on('item:add', function(e, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear items'
            },
            {
                label: 'Quit',
                accelerator:
                    process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If Mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator:
                    process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}
