export const useSaveAndClose = () => {
  return () => {
    if (!electronInternals) {
      throw new Error("Electron is not available");
    }

    if (!electronInternals.ipcRenderer) {
      throw new Error("Electron ipcRenderer is not available");
    }
    electronInternals.ipcRenderer.send("save-and-close");
  };
};
