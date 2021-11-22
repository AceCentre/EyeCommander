import { RobotKeyboard } from "./robot-keyboard";
import { DebugOutput } from "./debug-output";
import { GridOutput } from "./grid-output";
import os from "os";
import { OUTPUT_TYPE_NAME } from "../react-app/lib/store-consts";
import { NuVoice } from "./nu-voice";

const OUTPUT_TYPES = [RobotKeyboard, DebugOutput, GridOutput, NuVoice];

export class OutputController {
  constructor({ store }) {
    this.store = store;
    this.outputDevices = null;
    this.currentDevice = null;

    this.getOutputTypes();
  }

  async blink() {
    await this.ensureCurrentDeviceExists();
    await this.currentDevice.blink();
  }

  async ensureCurrentDeviceExists() {
    if (this.currentDevice) {
      return;
    }

    const currentlySelected = await this.getCurrentlySelected();

    let CurrentOutput = null;

    for (const current of OUTPUT_TYPES) {
      if (current.info().name === currentlySelected.name) {
        CurrentOutput = current;
      }
    }

    this.currentDevice = new CurrentOutput();
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

    this.currentDevice = null;

    return foundOutput;
  }
}
