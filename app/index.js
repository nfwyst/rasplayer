const electron = require('electron')

const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')

let mainWindow
function createWindow () {
  mainWindow = new BrowserWindow({
      width: 415,
      height: 758,
      resizable: false,
      title: '树莓派媒体中心',
    //   transparent: true,
    //   titleBarStyle: 'hidden',
    //   moveable: true,
  })
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
