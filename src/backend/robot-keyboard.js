import { AbstractOutput } from "./abstract-output";
import sendkeys from "sendkeys";

export class RobotKeyboard extends AbstractOutput {
  constructor() {
    super();
  }

  blink() {
    sendkeys.sync(" ");
  }

  static getCompatiblePlatforms() {
    return ["win32"];
  }

  static info() {
    return {
      name: "Keyboard Emulator",
      description:
        "Emulates a keyboard. Outputs a 'space' keypress for a blink",
      icon: "KeyboardIcon",
    };
  }
}
