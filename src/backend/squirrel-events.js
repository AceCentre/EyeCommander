const path = require("path");
const spawn = require("child_process").spawn;
const app = require("electron").app;
const logger = require("electron-log");
const { isAdmin } = require("./is-admin");
const fs = require("fs");

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

const SIXTY_FOUR_BIT_ARCHES = ["arm64", "x64"];

function is64BitArch(arch) {
  return SIXTY_FOUR_BIT_ARCHES.includes(arch);
}

const makeEdit = async () => {
  const rcedit64 = path.resolve(__dirname, "..", "rcedit", "rcedit-x64.exe");
  const rcedit32 = path.resolve(__dirname, "..", "bin", "rcedit.exe");
  const rceditExe = is64BitArch(process.arch) ? rcedit64 : rcedit32;

  const batchFileContent = `
    timeout 5
    
    ${rceditExe} ${process.execPath} --set-requested-execution-level requireAdministrator

    start ${process.execPath}
  `;

  const batchScriptPath = path.resolve(
    path.dirname(process.execPath),
    "..",
    "SetAdmin.bat"
  );

  logger.info({ batchFileContent, batchScriptPath });

  fs.writeFileSync(batchScriptPath, batchFileContent);

  spawn("cmd.exe", ["/c", batchScriptPath], {
    detached: true,
  }).on("spawn", () => {
    logger.info("closing");
    app.quit();
  });
};

module.exports = check();
