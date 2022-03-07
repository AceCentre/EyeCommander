import { AbstractOutput } from "./abstract-output";

import sendkeys from "sendkeys";

export class NuVoice extends AbstractOutput {
  constructor() {
    super();
  }

  blink() {
    console.log("tapping enter");
    sendkeys.sync("{ENTER}");
  }

  static getCompatiblePlatforms() {
    return ["win32"];
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
