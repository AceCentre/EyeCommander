import { AbstractOutput } from "./abstract-output";

function isDebug() {
  return process.env.npm_lifecycle_event === "start";
}

export class DebugOutput extends AbstractOutput {
  constructor() {
    super();
  }

  blink() {
    console.log("DEBUG OUTPUT");
  }

  // Only compatible when in debug mode so it doesnt appear on prod
  static getCompatiblePlatforms() {
    if (isDebug()) {
      return ["win32", "linux", "darwin"];
    }

    return [];
  }

  static info() {
    return {
      name: "Debug Output",
      description: "Logs to the console.",
      icon: "CodeIcon",
    };
  }
}
