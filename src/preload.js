// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronInternals", {
  ipcRenderer,
  onReload: (...props) => {
    ipcRenderer.on("reload", ...props);
  },
});
