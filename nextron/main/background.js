import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { getCurrentKeyboardEmulator } from "./helpers/keyboard-emulator";

const isProd = process.env.NODE_ENV === "production";

const KeyboardEmulator = getCurrentKeyboardEmulator();
let keyboardEmulator = new KeyboardEmulator({ vJoyDeviceId: 15 });

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  keyboardEmulator.onExit();
  app.quit();
});

ipcMain.on("trigger-keypress", async (event, key) => {
  await keyboardEmulator.pressKey(key);

  event.sender.send(
    "trigger-keypress-success",
    `Successfully caused keypress ${key}`
  );
});
