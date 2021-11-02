import { useState, useCallback, useEffect } from "react";
import { PRIMARY_DEVICE_ID } from "../lib/store-consts";
import { useStoreValue } from "./use-store";

export const useWebcamSelector = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    loading: loadingDevice,
    value: primaryDeviceId,
    update: storeDeviceId,
  } = useStoreValue(PRIMARY_DEVICE_ID);

  const updateDeviceId = (newDeviceId) => {
    setDeviceId(newDeviceId);
    storeDeviceId(newDeviceId);
  };

  useEffect(() => {
    const getDevices = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cameraDevices = allDevices.filter(
        ({ kind }) => kind === "videoinput"
      );
      setDevices(cameraDevices);

      if (primaryDeviceId == null && cameraDevices.length > 0) {
        updateDeviceId(cameraDevices[0].deviceId);
      } else if (
        cameraDevices.find(({ deviceId }) => deviceId === primaryDeviceId) !==
        -1
      ) {
        updateDeviceId(primaryDeviceId);
      } else if (cameraDevices.length > 0) {
        updateDeviceId(cameraDevices[0].deviceId);
      } else {
        updateDeviceId(null);
      }

      setLoading(false);
    };

    if (!loadingDevice) {
      getDevices();
    }
  }, [setDevices, loadingDevice]);

  return {
    devices,
    loading,
    setDeviceId: updateDeviceId,
    selectedDeviceId: deviceId,
  };
};
