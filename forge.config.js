// if (os.platform() === "darwin") {
//   icon = "./assets/apple-icon.icns";

//   osxSigning = {
//     osxSign: {
//       identity: "Developer ID Application: THE ACE CENTRE-NORTH (K45HHA96ND)",
//       "hardened-runtime": true,
//       entitlements: "./assets/entitlements.plist",
//       "entitlements-inherit": "./assets/entitlements.plist",
//       "signature-flags": "library",
//       "gatekeeper-assess": false,
//     },
//   };

//   console.log("=========");
//   if (
//     process.env.APPLE_ID &&
//     process.env.APPLE_ID_PASSWORD &&
//     process.env.APPLE_PROVIDER
//   ) {
//     console.log("SIGNING PARAMS ADDED");
//     osxSigning.osxNotarize = {
//       appleId: process.env.APPLE_ID,
//       appleIdPassword: process.env.APPLE_ID_PASSWORD,
//       ascProvider: process.env.APPLE_PROVIDER,
//     };
//   } else {
//     console.log("NO SIGNING PARAMS IN ENV");
//   }
//   console.log("=========");
// }

module.exports = {
  electronRebuildConfig: {
    force: true,
    useCache: false,
  },
  packagerConfig: {
    icon: "./assets/apple-icon.icns",
    executableName: "EyeCommander",
    osxSign: {
      identity: "Developer ID Application: THE ACE CENTRE-NORTH (K45HHA96ND)",
      "hardened-runtime": true,
      entitlements: "./assets/entitlements.plist",
      "entitlements-inherit": "./assets/entitlements.plist",
      "signature-flags": "library",
      "gatekeeper-assess": false,
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      ascProvider: process.env.APPLE_PROVIDER,
    },
  },
  publishers: [],
  makers: [
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO",
        name: "EyeCommander",
        icon: "./assets/apple-icon.png",
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
