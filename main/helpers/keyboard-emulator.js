import robot from "robotjs";

class KeyboardEmulator {
  constructor() {
    if (this.constructor.name === "KeyboardEmulator") {
      throw new Error("This is an abstract class");
    }
  }

  pressKey() {
    throw new Error("pressKey must be defined by the child class");
  }
}

class MacKeyboardEmulator extends KeyboardEmulator {
  constructor() {
    super();
  }

  pressKey(key) {
    console.log(`Fake keypress of ${key}`);
  }
}

class WindowsKeyboardEmulator extends KeyboardEmulator {
  constructor() {
    super();
  }

  pressKey(key) {
    robot.keyTap(key);
  }
}

export const createKeyboardEmulator = () => {
  if (process.platform === "darwin") {
    return new MacKeyboardEmulator();
  }

  if (process.platform === "win32") {
    return new WindowsKeyboardEmulator();
  }

  // TODO Add a link to create an issue
  throw new Error(`Unsupported platform: ${process.platform}`);
};
