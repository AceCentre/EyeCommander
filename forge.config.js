const os = require("os");

let icon = undefined;
let osxSigning = {};
let certParams = {};

if (os.platform() === "win32") {
  icon = "./assets/windows_icon.ico";

  // if (process.env.WIN_CERT_PASSWORD) {
  //   console.log("WINDOWS SIGNING PARAM FOUND");

  //   certParams = {
  //     certificateFile: "./win-cert.pfx",
  //     certificatePassword: process.env.WIN_CERT_PASSWORD,
  //     exe: "EyeCommander.exe",
  //     setupExe: "EyeCommanderSetup.exe",
  //   };
  // } else {
  //   console.log("NO WINDOWS SIGNING PARAMS");
  // }
}

if (os.platform() === "darwin") {
  icon = "./assets/apple-icon.icns";

  osxSigning = {
    osxSign: {
      identity: "Developer ID Application: THE ACE CENTRE-NORTH (K45HHA96ND)",
      "hardened-runtime": true,
      entitlements: "./assets/entitlements.plist",
      "entitlements-inherit": "./assets/entitlements.plist",
      "signature-flags": "library",
      "gatekeeper-assess": false,
    },
  };

  console.log("=========");
  if (
    process.env.APPLE_ID &&
    process.env.APPLE_ID_PASSWORD &&
    process.env.APPLE_PROVIDER
  ) {
    console.log("SIGNING PARAMS ADDED");
    osxSigning.osxNotarize = {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      ascProvider: process.env.APPLE_PROVIDER,
    };
  } else {
    console.log("NO SIGNING PARAMS IN ENV");
  }
  console.log("=========");
}

let publishers = [];

if (process.env.GITHUB_TOKEN) {
  publishers.push({
    name: "@electron-forge/publisher-github",
    config: {
      repository: {
        owner: "AceCentre",
        name: "EyeCommander",
      },
      prerelease: false,
      draft: false,
    },
  });
}

module.exports = {
  electronRebuildConfig: {
    force: true,
    useCache: false,
  },
  packagerConfig: {
    icon,
    win32metadata: {
      "requested-execution-level": "requireAdministrator",
    },
    ...osxSigning,
  },
  publishers,
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "EyeCommander",
        ...certParams,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO",
        name: "EyeCommander",
        icon: "./assets/apple-icon.png",
        additionalDMGOptions: {
          "code-sign": {
            identifier: "",
            "signing-identity": "",
          },
        },
      },
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        devContentSecurityPolicy: "*",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
              preload: {
                js: "./src/preload.js",
              },
            },
          ],
        },
      },
    ],
  ],
};
