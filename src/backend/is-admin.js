const process = require("process");
const { execSync } = require("child_process");
const logger = require("electron-log");

const testFltmc = () => {
  try {
    const command = "fltmc";
    const result = execSync(command);
    const resultAsString = result.toString();

    logger.info({ command, result: resultAsString });

    if (resultAsString.toLowerCase().includes("access is denied")) return false;

    return true;
  } catch (error) {
    return false;
  }
};

const isAdmin = () => {
  if (process.platform !== "win32") {
    return false;
  }

  try {
    const command = `fsutil dirty query ${process.env.systemdrive}`;
    const result = execSync(command);
    const resultAsString = result.toString();

    logger.info({ command, result: resultAsString });

    if (resultAsString.toLowerCase().includes("access is denied")) return false;

    return true;
  } catch (error) {
    return testFltmc();
  }
};

module.exports = { isAdmin };
