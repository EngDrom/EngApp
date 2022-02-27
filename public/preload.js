
/**
 * Speak with main thread
 */
 const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        receive: (channel, func) => {
            ipcRenderer.on(channel, (...args) => func(...args));
        }
    }
);



const ejs = require('ejs')
const fs = require('fs')

window.addEventListener('DOMContentLoaded', () => {
    let ctx = {}
    if (process.env.EJS_CONTEXT)
        ctx = JSON.parse(process.env.EJS_CONTEXT)
    ctx['CONST__COMMUNICATION__PRIVATE_KEY'] = process.env.PRIVATE_KEY
    
    if (window.location.search.startsWith("?project=")) {
        process.env.PROJECT = window.location.search.replace('?project=', '')
        process.env.APP.PROJECT = process.env.PROJECT
        window.PROJECT = process.env.PROJECT
        window.PROJECT_NAME = process.env.PROJECT.split("/")
        window.PROJECT_NAME = window.PROJECT_NAME[window.PROJECT_NAME.length - 1]
        window.location.replace(`file://${__dirname}/templates/project/index.html?proj=` + window.PROJECT)
    }
    
    // document.head.innerHTML = ejs.render(document.head.innerHTML, ctx)
    document.body.innerHTML = ejs.render(document.body.innerHTML.replaceAll("&lt;", "<").replaceAll("&gt;", ">"), ctx)
})