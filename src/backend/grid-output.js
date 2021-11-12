import { AbstractOutput } from "./abstract-output";
import { U } from "win32-api";

export class GridOutput extends AbstractOutput {
  constructor() {
    super();

    this.user32 = U.load();
    this.user32.RegisterWindowMessage("Sensory_SwitchInput");
  }

  blink() {
    console.log("GRID OUTPUT");
  }

  // Only compatible when in debug mode so it doesnt appear on prod
  static getCompatiblePlatforms() {
    return ["win32"];
  }

  static info() {
    return {
      name: "Smartbox Grid",
      description: "Outputs to Smartbox's Grid software",
      icon: "Grid4x4Icon",
    };
  }
}
