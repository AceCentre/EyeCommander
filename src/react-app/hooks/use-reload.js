import { useEffect, useReducer } from "react";

export const useReload = () => {
  const [reloadTrigger, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!electronInternals) {
      throw new Error("Electron is not available");
    }

    if (!electronInternals.ipcRenderer) {
      throw new Error("Electron ipcRenderer is not available");
    }

    if (!electronInternals.onReload) {
      throw new Error("Electron ipcRenderer is not available");
    }

    electronInternals.onReload(() => {
      forceUpdate();

      console.log("============");
      console.log("reload");
    });
  }, []);

  useEffect(() => {
    console.log("reloaded", reloadTrigger % 2 === 0, reloadTrigger);

    if (reloadTrigger % 2 !== 0) {
      forceUpdate();
    }
  }, [reloadTrigger]);

  console.log("reloadTrigger", reloadTrigger);

  return reloadTrigger;
};
