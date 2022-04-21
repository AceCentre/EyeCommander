import { useEffect } from "react";

export const useResizer = ({ width, height, loading }) => {
  useEffect(() => {
    if (loading) return;

    if (!electronInternals) {
      throw new Error("Electron is not available");
    }

    if (!electronInternals.ipcRenderer) {
      throw new Error("Electron ipcRenderer is not available");
    }

    electronInternals.ipcRenderer.send("resize-window", width, height);
  }, [height, width, loading]);
};
