export class AbstractOutput {
  constructor() {
    if (this.constructor.name === "KeyboardEmulator") {
      throw new Error("This is an abstract class");
    }
  }

  async blink() {
    throw new Error("Method not implemented");
  }

  // Possible values 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', and 'win32'
  static getCompatiblePlatforms() {
    throw new Error("Method not implemented");
  }

  static info() {
    throw new Error("Method not implemented");
  }
}
