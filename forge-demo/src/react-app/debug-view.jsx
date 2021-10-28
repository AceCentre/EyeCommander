import React, { useRef } from "react";
import Webcam from "react-webcam";
import { useWebcamSelector } from "./hooks/use-webcam-selector";

export const DebugView = () => {
  const webcamRef = useRef(null);

  const { devices, loading, selectedDeviceId, setDeviceId } =
    useWebcamSelector();

  if (loading) {
    return <p>Loading.....</p>;
  }

  if (devices.length === 0) {
    return <p>No webcams found</p>;
  }

  return (
    <>
      <select
        onChange={(event) => {
          setDeviceId(event.target.value);
        }}
      >
        {devices.map((device) => (
          <option value={device.deviceId}>{device.label}</option>
        ))}
      </select>
      <Webcam
        ref={webcamRef}
        videoConstraints={{ deviceId: selectedDeviceId }}
      />
    </>
  );
};
