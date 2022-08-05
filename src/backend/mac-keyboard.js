import { AbstractOutput } from "./abstract-output";

import { WEB_KEY_TO_ROBOT_KEY } from "../web-key-to-os-key";
import robot from "robotjs";

const getWithDefault = (store, id, defaultVal) => {
  const val = store.get(id);

  if (val !== undefined) return val;

  store.set(id, defaultVal);

  return defaultVal;
};

export class MacKeyboard extends AbstractOutput {
  constructor({ store }) {
    super();

    this.store = store;
  }

  blink() {
    const webKey = getWithDefault(this.store, "CURRENT_WEB_KEY", " ");
    const osKey = WEB_KEY_TO_ROBOT_KEY[webKey.toLowerCase()];

    robot.keyTap(osKey);

    console.log("BLINK", osKey, webKey);
  }

  static getCompatiblePlatforms() {
    return ["darwin"];
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
