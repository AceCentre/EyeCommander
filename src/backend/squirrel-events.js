const path = require("path");
const spawn = require("child_process").spawn;
const app = require("electron").app;
const logger = require("electron-log");
const sudo = require("sudo-prompt");
const { isAdmin } = require("./is-admin");

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
      logger.info("\n===== MAKING RCEDIT ======");

      logger.info({ target, execPath: process.execPath });

      if (!target.toLowerCase().includes("electron.exe")) {
        const isAlreadyAdmin = isAdmin();

        if (isAlreadyAdmin) {
          logger.info(
            "User is already admin, so skipping changing the execution level"
          );
        } else {
          await makeEdit();
          app.quit();
        }
      } else {
        logger.info("Skipping rcedit because electron is in the path");
        logger.info({ "requested-execution-level": "requireAdministrator" });
      }

      logger.info("\n===== MADE EDIT SUCCESSFULLY =====");
    } catch (error) {
      logger.info(error);
      logger.info("\n===== FAILED TO MAKE EDIT =====");
    }
  }
  return false;
};

const makeEdit = () => {
  return new Promise((res, rej) => {
    const options = {
      name: "EyeCommander SpawnProcess",
    };
    sudo.exec(
      `start ${process.execPath}`,
      options,
      function (error, stdout, stderr) {
        logger.info({ stdout, stderr, error });

        if (!error) return rej(error);

        res();
      }
    );
  });
};

module.exports = check();
