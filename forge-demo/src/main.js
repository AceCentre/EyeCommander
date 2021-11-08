import express from "express";

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store");

// Application state
const store = new Store();
let settingsWindow = null;
let mainWindow = null;

function isDebug() {
  return process.env.npm_lifecycle_event === "start";
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (javascriptToExecute) => {
  // Create the browser window.
  const currentWindow = new BrowserWindow({
    width: 400,
    height: 400,
    resizable: process.env.NODE_ENV === "development",
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, // use a preload script
    },
  });

  if (javascriptToExecute) {
    console.log("Trying to execute javascript");
    currentWindow.webContents.executeJavaScript(javascriptToExecute, true);
  }

  if (isDebug()) {
    // Create the browser window.
    currentWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    currentWindow.webContents.openDevTools();
  } else {
    const exApp = express();
    exApp.use(express.static(path.resolve(__dirname, "..", "renderer")));
    const server = exApp.listen(0, () => {
      console.log(`port is ${server.address().port}`);
      currentWindow.loadURL(
        `http://localhost:${server.address().port}/main_window/`
      );
    });
  }

  return currentWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  console.log("APP READY");

  mainWindow = createWindow();

  mainWindow.on("close", () => {
    mainWindow = null;
  });
});

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
    mainWindow = createWindow();

    mainWindow.on("close", () => {
      mainWindow = null;
    });
  }
});

ipcMain.handle("getStoreValue", (event, key) => {
  console.log("Getting: ", key);

  return store.get(key);
});

ipcMain.on("resize-window", (event, width, height) => {
  let browserWindow = BrowserWindow.fromWebContents(event.sender);
  browserWindow.setSize(width, height);
});

ipcMain.handle("setStoreValue", (event, key, value) => {
  console.log("Setting: ", key, value);

  return store.set(key, value);
});

// const KeyboardEmulator = getCurrentKeyboardEmulator();
// let keyboardEmulator = new KeyboardEmulator({ vJoyDeviceId: 15 });

ipcMain.on("blink", async () => {
  console.log("Blink got");
});

const reloadMain = () => {
  console.log("RELOAD MAIN");

  if (mainWindow) {
    mainWindow.webContents.send("reload");
  } else {
    mainWindow = createWindow();

    mainWindow.on("close", () => {
      mainWindow = null;
    });
  }
};

ipcMain.on("save-and-close", async () => {
  if (settingsWindow) {
    // Close the current window
    settingsWindow.close();
  }
});

ipcMain.on("open-settings", async () => {
  if (settingsWindow) {
    // Close the current window
    settingsWindow.close();
  }

  settingsWindow = createWindow("window.IS_SETTINGS_PAGE = true;");

  settingsWindow.on("close", () => {
    console.log("Settings window closed");
    reloadMain();
    settingsWindow = null;
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
