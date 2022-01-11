// Mostly taken from https://github.com/sindresorhus/is-admin/blob/main/index.js
// Didnt use lib directly because it relied on a library that wasn't buundling nicely

const process = require("process");
const { execSync } = require("child_process");
const logger = require("electron-log");

const testFltmc = () => {
  try {
    // Run fltmc which only works as an admin. You will get an access denied error if you are not admin
    const command = "fltmc";
    const result = execSync(command);
    const resultAsString = result.toString();

    logger.info({ command, result: resultAsString });

    // If we get access denied return false
    if (resultAsString.toLowerCase().includes("access is denied")) return false;

    // Otherwise we are admin
    return true;
  } catch (error) {
    // If this throws then we assume you are not admin
    return false;
  }
};

// Check if the current process has adminitrator privilages
// Only for windows.
const isAdmin = () => {
  if (process.platform !== "win32") {
    return false;
  }

  try {
    // Run fsutil on the root system drive. You will get an access denied error if you are not admin
    const command = `fsutil dirty query ${process.env.systemdrive}`;
    const result = execSync(command);
    const resultAsString = result.toString();

    logger.info({ command, result: resultAsString });

    // If access is denied then we return false
    if (resultAsString.toLowerCase().includes("access is denied")) return false;

    // Otherwise it was successful
    return true;
  } catch (error) {
    // If the 'fsutil' threw an error then we want to try a different command
    return testFltmc();
  }
};

module.exports = { isAdmin };
