import { AbstractOutput } from "./abstract-output";
import robot from "robotjs";

export class RobotKeyboard extends AbstractOutput {
  constructor() {
    super();
  }

  blink() {
    console.log("tapping space");
    robot.keyTap("space");
  }

  static getCompatiblePlatforms() {
    return ["win32", "linux", "darwin"];
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
