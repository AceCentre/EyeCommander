// If we are on windows then we want to install ffi-napi
// If we are not we want to mock it

const os = require("os");
const fs = require("fs");
const path = require("path");

const VERSION = "4.0.3";

console.log("======= Setup Win Deps ========");

const packageJson = require("./package.json");
const { execSync } = require("child_process");
const newPackageJson = {
  ...packageJson,
  dependencies: { ...packageJson.dependencies, "ffi-napi": VERSION },
};

if (os.platform() === "win32") {
  console.log("Adding 'ffi-napii' to package.json");
  fs.writeFileSync(
    path.join(__dirname, "./package.json"),
    JSON.stringify(newPackageJson, null, 2) + os.EOL
  );
} else {
  console.log("Stubbing ffi-napi");
  execSync(
    "cd ./fake-ffi-napi && yarn link && cd ../ && yarn link ffi-napi",
    { stdio: "inherit" }
  );
}

console.log("===============================");
