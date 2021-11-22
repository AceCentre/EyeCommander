import { AbstractOutput } from "./abstract-output";
import robot from "robotjs";

export class NuVoice extends AbstractOutput {
  constructor() {
    super();
  }

  blink() {
    console.log("tapping enter");
    robot.keyTap("enter");
  }

  static getCompatiblePlatforms() {
    return ["win32", "darwin"];
  }

  static info() {
    return {
      name: "NuVoice",
      description:
        "Emulates a keyboard. Outputs an 'enter' keypress for a blink",
      icon: "ChatBubbleOutlineIcon",
    };
  }
}
