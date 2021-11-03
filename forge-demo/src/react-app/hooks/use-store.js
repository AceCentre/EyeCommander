import React, { useEffect, useState } from "react";

export const useStoreValue = (key, defaultValue = null) => {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!electronInternals) {
    throw new Error("Electron is not available");
  }

  if (!electronInternals.ipcRenderer) {
    throw new Error("Electron ipcRenderer is not available");
  }

  useEffect(() => {
    const getValueFromStore = async () => {
      const result = await electronInternals.ipcRenderer.invoke(
        "getStoreValue",
        key
      );

      if (result === undefined) {
        await electronInternals.ipcRenderer.invoke(
          "setStoreValue",
          key,
          defaultValue
        );
        const newResult = await electronInternals.ipcRenderer.invoke(
          "getStoreValue",
          key
        );

        setValue(newResult);
        setLoading(false);
        console.log("Get value defaulted", key, newResult);
      } else {
        setValue(result);
        setLoading(false);
        console.log("Get value", key, result);
      }
    };

    getValueFromStore();
  }, []);

  const update = async (newValue) => {
    await electronInternals.ipcRenderer.invoke("setStoreValue", key, newValue);
    setValue(newValue);
  };

  return { value, loading, update };
};
