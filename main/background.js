import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import robot from "robotjs";

const isProd = process.env.NODE_ENV === "production";

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
  app.quit();
});

ipcMain.on("trigger-keypress", async (event, key) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const result = robot.keyTap("enter");
  // Speed up the mouse.
  robot.setMouseDelay(2);
  const twoPI = Math.PI * 2.0;
  const screenSize = robot.getScreenSize();
  const height = screenSize.height / 2 - 10;
  const width = screenSize.width;

  console.log({ twoPI, screenSize, height, width });

  for (var x = 0; x < width; x++) {
    const y = height * Math.sin((twoPI * x) / width) + height;

    console.log({ x, y });

    robot.moveMouse(x, y);
  }

  event.sender.send(
    "trigger-keypress-success",
    `Successfully caused keypress ${key}`
  );
});
