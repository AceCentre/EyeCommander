const os = require("os");

let icon = undefined;

if (os.platform() === "darwin") {
  icon = "./assets/apple-icon.icns";
}

module.exports = {
  electronRebuildConfig: {
    force: true,
    useCache: false,
  },
  packagerConfig: { icon },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "EyeCommander",
      },
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
