const path = require("path");
const spawn = require("child_process").spawn;
const app = require("electron").app;
const logger = require("electron-log");
const sudo = require("sudo-prompt");
const { isAdmin } = require("./is-admin");

// Runs the Update.exe which is created by the squirrel installer process.
// Detaches it from this process.
const run = function (args, done) {
  const updateExe = path.resolve(
    path.dirname(process.execPath),
    "..",
    "Update.exe"
  );
  logger.info("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true,
  }).on("close", () => {
    logger.info("Calling done which will close");
    done();
  });
};

const check = async function () {
  // We only want to run this code on windows
  if (process.platform === "win32") {
    const cmd = process.argv[1];
    logger.info("processing squirrel command `%s`", cmd);
    const target = path.basename(process.execPath);

    // If we are installing then we want to add the shortcut to the desktop
    // Quit afer we have done that because the installer will reopen afterwards
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target + ""], app.quit);
      return true;
    }

    // If we are uninstalling then we remove the shortcut.
    // After we do that close eyecommander
    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target + ""], app.quit);
      return true;
    }

    // If we are given the command to close we close
    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }

    // EyeCommander must be opened as an admin because otherwise
    // grid3 and other pieces of software will ignore messages.
    // This code will spawn a new version of EyeCommander as an admin
    // then close the existing processes
    // Wrapped in a try catch because we want EyeCommander
    // to remain open even if this process fails. It will just be
    // limited to a normal user
    try {
      logger.info("\n===== ATTEMPTING TO ELEVATE TO ADMIN ======");
      logger.info({ target, execPath: process.execPath });

      // Dont elevate the process if the target is electon.exe
      // The target is only called electron.exe when you are in dev mode
      if (!target.toLowerCase().includes("electron.exe")) {
        const isAlreadyAdmin = isAdmin();

        // Check if the current process is admin. If it is we just bail out
        // if its not admin we want to elecate
        if (isAlreadyAdmin) {
          logger.info(
            "User is already admin, so skipping changing the execution level"
          );
        } else {
          // Spawn the new process and then exit this one.
          await openAdminEyeCommander();
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

// Use sudo-prompt library to start a new process as admin
// Runs 'start path/to/eyecommander.exe' so that it detaches from this node process.
const openAdminEyeCommander = () => {
  return new Promise((res, rej) => {
    const options = {
      name: "EyeCommander SpawnProcess",
    };

    logger.info("Running the following command:");
    logger.info(`"${process.execPath}"`);

    sudo.exec(
      `Start-Process -FilePath "${process.execPath}"`,
      options,
      function (error, stdout, stderr) {
        logger.info("Executed with the following results:");
        logger.info({ stdout, stderr, error });
        logger.info("See above results");

        if (error) return rej(error);

        res();
      }
    );
  });
};

// As soon as this file is required we run this code.
module.exports = check();
