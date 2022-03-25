import { AbstractOutput } from "./abstract-output";
import sendkeys from "sendkeys";
import { WEB_KEY_TO_OS_KEY } from "../web-key-to-os-key";

const getWithDefault = (store, id, defaultVal) => {
  const val = store.get(id);

  if (val !== undefined) return val;

  store.set(id, defaultVal);

  return defaultVal;
};
export class RobotKeyboard extends AbstractOutput {
  constructor({ store }) {
    super();

    this.store = store;
  }

  blink() {
    const webKey = getWithDefault(this.store, "CURRENT_WEB_KEY", " ");
    const osKey = WEB_KEY_TO_OS_KEY[webKey.toLowerCase()];

    sendkeys.sync(osKey);
  }

  static getCompatiblePlatforms() {
    return ["win32", "darwin"];
  }

  static info() {
    return {
      name: "Keyboard Emulator",
      description:
        "Emulates a keypress. Allows you to change the key that is pressed.",
      icon: "KeyboardIcon",
    };
  }
}
