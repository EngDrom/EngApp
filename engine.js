

const { randomInt } = require('crypto');
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path')
const fspath = path;
var remote = require('electron').remote;

// Private communication key between services
process.env.PRIVATE_KEY = [0, 0, 0, 0, 0, 0, 0, 0].map((el) => {
  return "abcdefghijklmnopqrstuvwxyz".at(randomInt(26) % 26)
}).join("");

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'public/preload.js'),
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      }
    })
    app.WINDOW = win
    const menu = require('./public/menu')

    process.env.APP = app
    process.env.EJS_CONTEXT = JSON.stringify({"age": 12, "healthy": true})
    ipcMain.postMessage = (channel, ...args) => {
      win.webContents.postMessage(channel, ...args)
    }
    win.loadFile(path.join(__dirname, 'public/templates/index.html'))
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
  })
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })


ipcMain.on('set_project', (event, ...args) => {
  process.env.PROJECT = args[0]
})

function readdir (path, depth=-1) {
  if (!fs.lstatSync(path).isDirectory()) return { path: path, is_dir: false, name: fspath.basename(path) }

  return {
    'path':path,
    'name': fspath.basename(path),
    'is_dir':true,
    'data': fs.readdirSync(path).map((el) => {
      return readdir(fspath.join(path, el), depth - 1)
    })
  }
}

ipcMain.on('read_tree', (event, ...args) => {
  let project = args[0]
  
  event.reply('read_tree', JSON.stringify(readdir(project)))
})
ipcMain.on('engine:file:save', (event, ...args) => {
  console.log(event)
  console.log(args)
  let project = args[0]
  let file = args[1]
  let text = args[2]

  fs.writeFileSync(path.join(project, file), text)
})
ipcMain.on('engine:file:read', (event, ...args) => {
  let project = args[0]
  let file = args[1]

  let text = fs.readFileSync(path.join(project, file), 'utf-8').toString()

  event.reply('file:read', file, text)
})