// This doesnt need to be a hook but we are future proofing a little

export const useOpenSettings = () => {
  return async () => {
    if (!electronInternals) throw new Error("Couldnt find electron internals");
    if (!electronInternals.ipcRenderer)
      throw new Error("Couldnt find ipcRenderer");

    electronInternals.ipcRenderer.send("open-settings");
  };
};
