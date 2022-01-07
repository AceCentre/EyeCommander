const path = require("path");
const spawn = require("child_process").spawn;
const app = require("electron").app;
const logger = require("electron-log");
const regeditRaw = require("regedit");
const regedit = regeditRaw.promisified;

const run = function (args, done) {
  const updateExe = path.resolve(
    path.dirname(process.execPath),
    "..",
    "Update.exe"
  );
  logger.info("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true,
  }).on("close", done);
};

const check = async function () {
  if (process.platform === "win32") {
    const cmd = process.argv[1];
    logger.info("processing squirrel command `%s`", cmd);
    const target = path.basename(process.execPath);
    logger.info("\n===== MAKING REG EDIT ======");
    const keyPath =
      "HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers";
    const execPath = process.execPath.includes("electron.exe")
      ? `localDevPath-${new Date().toISOString()}`
      : process.execPath;

    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target + ""], app.quit);
      return true;
    }
    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target + ""], app.quit);
      return true;
    }
    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }

    try {
      await regedit.createKey(keyPath);
      await regedit.putValue({
        [keyPath]: {
          [execPath]: {
            value: "~RUNASADMIN",
            type: "REG_SZ",
          },
        },
      });
      logger.info("===== MADE EDIT SUCCESSFULLY =====");
    } catch (error) {
      logger.info(error);
      logger.info("===== FAILED TO MAKE EDIT =====");
    }
  }
  return false;
};

module.exports = check();
