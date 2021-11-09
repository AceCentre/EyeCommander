import { useState, useEffect } from "react";
import { PRIMARY_DEVICE_ID } from "../lib/store-consts";
import { useStoreValue } from "./use-store";

export const useWebcamSelector = () => {
  const [deviceId, setDeviceId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    loading: loadingDevice,
    value: primaryDeviceName,
    update: storeDeviceName,
  } = useStoreValue(PRIMARY_DEVICE_ID);

  const updateDeviceId = (newDeviceId) => {
    setDeviceId(newDeviceId);

    const newDevice = devices.find((device) => device.deviceId === newDeviceId);

    if (!newDevice) throw new Error("Device not found");

    storeDeviceName(newDevice.label);
  };

  useEffect(() => {
    const getDevices = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cameraDevices = allDevices.filter(
        ({ kind }) => kind === "videoinput"
      );
      setDevices(cameraDevices);

      const currentDevice = cameraDevices.find(
        ({ label }) => label === primaryDeviceName
      );

      if (primaryDeviceName == null && cameraDevices.length > 0) {
        console.log("Picking the first device because no device set");

        setDeviceId(cameraDevices[0].deviceId);
        storeDeviceName(cameraDevices[0].label);
      } else if (currentDevice) {
        setDeviceId(currentDevice.deviceId);
        storeDeviceName(currentDevice.label);
      } else if (cameraDevices.length > 0) {
        console.log(
          `Picking the first device because we couldn't find the device with name ${primaryDeviceName}`
        );

        setDeviceId(cameraDevices[0].deviceId);
        storeDeviceName(cameraDevices[0].label);
      } else {
        console.log("No devices found");
        setDeviceId(null);
        storeDeviceName(null);
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
