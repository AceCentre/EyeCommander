module.exports = {
  electronRebuildConfig: {
    force: true,
    useCache: false,
  },
  packagerConfig: {
    appBundleId: "com.acecentre.eyecommander",
    icon: "./assets/apple-icon.icns",
    executableName: "EyeCommander",
    osxSign: {
      keychain: `${process.env.KEYCHAIN}.keychain-db`,
      identity: "Developer ID Application: THE ACE CENTRE-NORTH (K45HHA96ND)",
      "hardened-runtime": true,
      entitlements: "./assets/entitlements.plist",
      "entitlements-inherit": "./assets/entitlements.plist",
      "signature-flags": "library",
      "gatekeeper-assess": false,
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
