export const useSaveAndClose = () => {
  return () => {
    // if (!electronInternals) {
    //   throw new Error("Electron is not available");
    // }

    // if (!electronInternals.ipcRenderer) {
    //   throw new Error("Electron ipcRenderer is not available");
    // }

    console.log("save");
    // electronInternals.ipcRenderer.send("save-and-close");
  };
};
