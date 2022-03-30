// preload.js
const { contextBridge, ipcRenderer } = require("electron");
const shell = require("electron").shell;
const logger = require("electron-log");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronInternals", {
  ipcRenderer,
  onReload: (...props) => {
    ipcRenderer.on("reload", ...props);
  },
  openExternal: shell.openExternal,
  logger: logger.functions,
});
