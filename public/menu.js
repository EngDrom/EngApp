const { app, Menu, ipcRenderer } = require('electron')

const template = [
    {
        label: 'File',
        submenu: [
            { id: 'project:open', label: 'Open project...', accelerator: 'CommandORControl+Shift+O', click: () => {app.WINDOW.loadFile('./public/templates/index.html')} },
            { type: 'separator' },
            { id: 'file:open', label: 'Open', accelerator: 'CommandORControl+O', click: () => {} },
            { id: 'file:save', label: 'Save', accelerator: 'CommandORControl+S', click: () => {} },
            { type: 'separator' },
            { id: 'user:pref', label: 'User Preferences', click: () => {} }
        ]
    },
    {
        label:'Edit',
        submenu: [
            { id:'edit:undo', label: 'Undo', accelerator: 'CommandORControl+Z', click: () => {} },
            { id:'edit:redo', label: 'Redo', accelerator: 'CommandORControl+Y', click: () => {} },
        ]
    },
    {
        label:'View',
        submenu: [
            { id:'tools', label:'Tools', submenu:[
                { id:'tools:inspector', label:'Inspector Tools', accelerator: 'CommandORControl+Shift+I', click: () => {
                    app.WINDOW.webContents.toggleDevTools()
                } },
                { id:'tools:reload', label:'Reload', accelerator: 'F5', click: () => {
                    app.WINDOW.reload()
                } }
            ] }
        ]
    }
  ]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)