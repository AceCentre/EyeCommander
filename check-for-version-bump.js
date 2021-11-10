const packageJson = require("./package.json");

module.exports = async ({ github, context, core }) => {
  console.log("Checking versions");
  const currentVersion = packageJson.version;

  console.log(`Current version: ${currentVersion}`);

  return "dont";
};
