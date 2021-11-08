import { RobotKeyboard } from "./robot-keyboard";
import { DebugOutput } from "./debug-output";
import os from "os";
import { OUTPUT_TYPE_NAME } from "../react-app/lib/store-consts";

const OUTPUT_TYPES = [RobotKeyboard, DebugOutput];

export class OutputController {
  constructor({ store }) {
    this.store = store;
    this.outputDevices = [];
  }

  getOutputTypes() {
    let valid = [];
    const currentPlatform = os.platform();

    for (const current of OUTPUT_TYPES) {
      const currentValidPlatforms = current.getCompatiblePlatforms();

      if (currentValidPlatforms.includes(currentPlatform)) {
        valid.push(current);
      }
    }

    console.log("Valid platforms");

    this.outputDevices = valid;

    return valid.map((x) => x.info());
  }

  async getCurrentlySelected() {
    const outputName = this.store.get(OUTPUT_TYPE_NAME);

    if (!outputName) {
      this.store.set(OUTPUT_TYPE_NAME, this.outputDevices[0].info().name);
      return this.outputDevices[0].info();
    }

    const foundOutput = this.outputDevices
      .map((x) => x.info())
      .find((x) => x.name === outputName);

    if (!foundOutput) {
      this.store.set(OUTPUT_TYPE_NAME, this.outputDevices[0].info().name);
      return this.outputDevices[0].info();
    }

    return foundOutput;
  }

  setCurrentlySelected(outputName) {
    const foundOutput = this.outputDevices
      .map((x) => x.info())
      .find((x) => x.name === outputName);

    if (!foundOutput) {
      this.store.set(OUTPUT_TYPE_NAME, foundOutput.name);
      return foundOutput;
    }

    this.store.set(OUTPUT_TYPE_NAME, foundOutput.name);

    return foundOutput;
  }
}
