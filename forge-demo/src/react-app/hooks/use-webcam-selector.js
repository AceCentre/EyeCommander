import { useState, useCallback, useEffect } from "react";

export const useWebcamSelector = () => {
  const [deviceId, setDeviceId] = useState({});
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDevices = useCallback(
    (mediaDevices) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
      setLoading(false);

      if (devices.length > 0) {
        setDeviceId(devices[0].deviceId);
      }
    },
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return { devices, loading, setDeviceId, selectedDeviceId: deviceId };
};
