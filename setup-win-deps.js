// If we are on windows then we want to install win32-api
// If we are not we want to mock it

const os = require("os");
const fs = require("fs");
const path = require("path");

const VERSION = "9.6.0";

console.log("======= Setup Win Deps ========");

const packageJson = require("./package.json");
const { execSync } = require("child_process");
const newPackageJson = {
  ...packageJson,
  dependencies: { ...packageJson.dependencies, "win32-api": VERSION },
};

if (os.platform() === "win32") {
  console.log("Adding 'win32-api' to package.json");
  fs.writeFileSync(
    path.join(__dirname, "./package.json"),
    JSON.stringify(newPackageJson, null, 2) + os.EOL
  );
} else {
  console.log("Stubbing win32-api");
  execSync(
    "cd ./fake-win32-api && yarn link && cd ../ && yarn link win32-api",
    { stdio: "inherit" }
  );
}

console.log("===============================");
