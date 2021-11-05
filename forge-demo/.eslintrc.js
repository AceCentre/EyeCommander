module.exports = {
  ignorePatterns: ["**/public/**/*.js"],
  globals: {
    electronInternals: "readonly",
    MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: "readonly",
    MAIN_WINDOW_WEBPACK_ENTRY: "readonly",
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double", { avoidEscape: true }],
    semi: ["error", "always"],
    "react/react-in-jsx-scope": "off", // Next means we don't need this
    "react/prop-types": "off", // We don't use prop types
    "react/display-name": "off", // This fails even when we have a name, it also doesn't really matter
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
