import { AbstractOutput } from "./abstract-output";

import sendkeys from "sendkeys";

export class MindExpress extends AbstractOutput {
  constructor() {
    super();
  }

  blink() {
    console.log("tapping space");
    sendkeys.sync("{SPACE}");
  }

  static getCompatiblePlatforms() {
    return ["win32"];
  }

  static info() {
    return {
      name: "Mind Express",
      description:
        "Emulates a keyboard. Outputs an 'space' keypress for a blink",
      icon: "FaceIcon",
    };
  }
}
