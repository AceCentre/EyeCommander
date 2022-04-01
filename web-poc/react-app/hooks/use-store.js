import React, { useEffect, useState } from "react";

export const useStoreValue = (key, defaultValue = null) => {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [forceReloadCounter, setForceReloadCounter] = useState(0);

  // if (!electronInternals) {
  //   throw new Error("Electron is not available");
  // }

  // if (!electronInternals.ipcRenderer) {
  //   throw new Error("Electron ipcRenderer is not available");
  // }

  useEffect(() => {
    const getValueFromStore = async () => {
      const result = localStorage.getItem(key);

      console.log({ result });

      if (result === undefined || result === null) {
        localStorage.setItem(key, defaultValue);
        const newResult = localStorage.getItem(key);

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
  }, [forceReloadCounter]);

  const update = async (newValue) => {
    localStorage.setItem(key, newValue);
    setValue(newValue);
  };

  const reload = () => {
    setForceReloadCounter((prev) => prev + 1);
  };

  return { value, loading, update, reload };
};
