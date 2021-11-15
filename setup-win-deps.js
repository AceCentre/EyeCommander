// If we are on windows then we want to install ffi-napi
// If we are not we want to mock it

const os = require("os");
const { execSync } = require("child_process");

console.log("======= Setup Win Deps ========");

if (os.platform() !== "win32") {
  console.log("Stubbing ffi-napi");
  execSync("cd ./fake-ffi-napi && yarn link && cd ../ && yarn link ffi-napi", {
    stdio: "inherit",
  });
}

console.log("===============================");
