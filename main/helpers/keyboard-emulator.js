import robot from "robotjs";
import { vJoy, vJoyDevice } from 'vjoy';

class KeyboardEmulator {
  constructor() {
    if (this.constructor.name === "KeyboardEmulator") {
      throw new Error("This is an abstract class");
    }
  }

  async pressKey() {
    throw new Error("pressKey must be defined by the child class");
  }

  static getSetupProperties() {
    throw new Error("getSetupProperties must be defined by the child class");
  }

  onExit() {
    throw new Error("onExit must be defined by the child class");
  }
}

class MacKeyboardEmulator extends KeyboardEmulator {
  constructor() {
    super();
  }

  async pressKey(key) {
    console.log(`Fake keypress of ${key}`);
  }

  static getSetupProperties() {
    return [];
  }

  onExit() {}

}

class WindowsKeyboardEmulatorRobot extends KeyboardEmulator {
  constructor() {
    super();
  }

  async pressKey(key) {
    robot.keyTap(key);
  }

  static getSetupProperties() {
    return [];
  }

  onExit() {}
}


class WindowsKeyboardEmulatorVjoy extends KeyboardEmulator {
  constructor(setupProperties) {
    super();

    this.device = null;

    if (!vJoy.isEnabled()) {
      throw new Error('Uh oh, you dont have vJoy installed or enabled');
    }

    const vJoyDeviceId = setupProperties['vJoyDeviceId'];
    this.device = vJoyDevice.create(vJoyDeviceId);

    if(!this.device) {
      throw new Error(`Could not get the device with the given ID: ${vJoyDeviceId}, this could be because the device is being controlled by another process or the device has not been created`)
    }

    this.buttons = this.device.buttons;

    if(this.buttons.length < 6) {
      throw new Error(`You must have at least 5 buttons setup on the device, you only have ${this.buttons.length} setup on device ${vJoyDeviceId}`);
    }
  }

  static getSetupProperties() {
    return [{
      id: 'vJoyDeviceId',
      display: 'vJoy Device ID',
      type: 'number',
      min: 1,
      max: 16,
      help: "The ID displayed in vJoy configuration of the device you would like to use. Note it must be free for usage and not controlled by another application."
    }]
  }

  async pressKey(key) {
    const buttonMap = {
      'up': this.buttons[1],
      'down': this.buttons[2],
      'left': this.buttons[3],
      'right': this.buttons[4]
    }

    const currentButton = buttonMap[key.toLowerCase()];

    if(!currentButton) {
      throw new Error(`vJoy emulator doesnt have a button mapped for '${key}'`)
    }

    // Mark button as pressed for 500ms
    const buttonPressSuccess = currentButton.set(true);
    console.log({buttonPressSuccess})
    await new Promise((res) => setTimeout(res, 500));
    this.device.resetButtons();
    const buttonReleaseSuccess = currentButton.set(false);
    console.log({buttonReleaseSuccess})
  }

  onExit() {
    this.device.free();
  }
}

export const getCurrentKeyoardEmulator = () => {
  if (process.platform === "darwin") {
    return MacKeyboardEmulator;
  }

  if (process.platform === "win32") {
    return WindowsKeyboardEmulatorVjoy;
  }

  // TODO Add a link to create an issue
  throw new Error(`Unsupported platform: ${process.platform}`);
};
