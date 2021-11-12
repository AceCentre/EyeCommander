import { AbstractOutput } from "./abstract-output";

export class GridOutput extends AbstractOutput {
  constructor() {
    super();


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
