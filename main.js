npm publishconst {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const open = require('open');
const Server = require('./server/server');
const Login = require('./server/login');
const Host = require('./server/host');
const settings = require('./settings');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
const server = new Server(new Login(), { hostData: new Host(settings.port) });
server.start(settings.port);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({ x: 300, y: 100, width: 800, height: 600, frame: false, transparent: true, alwaysOnTop: true, webPreferences: { devTools: false } })

  const port = settings.port || 3000;
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: `localhost:${port}`,
    protocol: 'http:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  win.webContents.on('new-window', function (event, url) {
    event.preventDefault();
    open(url);
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
