import { AbstractOutput } from "./abstract-output";

export class RobotKeyboard extends AbstractOutput {
  constructor() {
    super();
  }

  blink() {
    console.log("ROBOT KEYBOARD OUTPUT");
  }

  static getCompatiblePlatforms() {
    return ["win32", "linux", "darwin"];
  }

  static info() {
    return {
      name: "Keyboard Emulator",
      description: "Emulates a keyboard. Using RobotJS under the hood",
      icon: "KeyboardIcon",
    };
  }
}
