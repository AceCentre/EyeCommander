import { AbstractOutput } from "./abstract-output";
import * as ffi from "ffi-napi";
import * as os from "os";

export class GridOutput extends AbstractOutput {
  constructor() {
    super();

    if (os.platform() !== "win32") {
      throw new Error(
        "You are somehow running this code on a non windows machine. That shouldnt happen. Just gonna bail now because I am about to load a bunch of windows DLLs which will break on any other machine"
      );
    }

    // Load the following functions from the user32 dll
    // The array has the following signature: [ReturnType, [arg1Type, arg2Type, etc....]]
    this.user32 = ffi.Library("user32.dll", {
      RegisterWindowMessageA: ["int", ["string"]],
      SendNotifyMessageA: ["bool", ["uint", "uint", "uint", "uint"]],
    });
  }

  async blink() {
    if (!this.windowMessage) {
      this.windowMessage = this.user32.RegisterWindowMessageA(
        "Sensory_SwitchInput"
      );
    }

    // Send a press message then a release message
    const pressResult = await this.user32.SendNotifyMessageA(
      65535,
      this.windowMessage,
      1,
      1
    );
    const releaseResult = await this.user32.SendNotifyMessageA(
      65535,
      this.windowMessage,
      1,
      1
    );

    console.log("GRID OUTPUT", {
      windowMessage: this.windowMessage,
      pressResult,
      releaseResult,
    });
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
