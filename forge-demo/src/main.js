const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
import express from "express";

const { getCurrentKeyboardEmulator } = require("./backend/keyboard-emulator");
const Store = require("electron-store");

const store = new Store();

function isDebug() {
  return process.env.npm_lifecycle_event === "start";
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}
const KeyboardEmulator = getCurrentKeyboardEmulator();
let keyboardEmulator = new KeyboardEmulator({ vJoyDeviceId: 15 });

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 700,
    height: 1255,
    resizable: process.env.NODE_ENV === "development",
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, // use a preload script
    },
  });

  if (isDebug()) {
    // Create the browser window.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.webContents.openDevTools();
  } else {
    const exApp = express();
    exApp.use(express.static(path.resolve(__dirname, "..", "renderer")));
    const server = exApp.listen(0, () => {
      console.log(`port is ${server.address().port}`);
      mainWindow.loadURL(
        `http://localhost:${server.address().port}/main_window/`
      );
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("getStoreValue", (event, key) => {
  console.log("Getting: ", key);

  return store.get(key);
});

ipcMain.handle("setStoreValue", (event, key, value) => {
  console.log("Setting: ", key, value);

  return store.set(key, value);
});
ipcMain.on("trigger-keypress", async (event, key) => {
  await keyboardEmulator.pressKey(key);

  event.sender.send(
    "trigger-keypress-success",
    `Successfully caused keypress ${key}`
  );
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
