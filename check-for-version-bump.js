const packageJson = require("./package.json");

module.exports = async ({ github, context, core }) => {
  console.log("Checking versions");
  const currentVersion = packageJson.version;

  console.log(`Current version: ${currentVersion}`);

  const latestRelease = await github.rest.repos.getLatestRelease({
    owner: "acecentre",
    repo: "eyecommander",
  });

  console.log("latestRelease", latestRelease);

  const latestVersion = latestRelease.data.name.replace("v", "");

  console.log(latestVersion);
  console.log(latestVersion === currentVersion);

  if (latestVersion === currentVersion) {
    console.log("make");
    return "make";
  } else {
    console.log("publish");
    return "publish";
  }
};
