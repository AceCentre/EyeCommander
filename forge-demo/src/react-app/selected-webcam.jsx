import React from "react";
import { Typography } from "@mui/material";
import Webcam from "react-webcam";
import { useWebcamSelector } from "./hooks/use-webcam-selector";
import { red } from "@mui/material/colors";

export const SelectedWebcam = (props) => {
  const { devices, loading, setDeviceId, selectedDeviceId } =
    useWebcamSelector();

  if (loading) return null;

  if (!selectedDeviceId) {
    <Typography
      sx={{ color: red[500], fontWeight: "bold", textAlign: "center" }}
    >
      You have no camera devices connected to your computer. Connect a camera
      device and then restart EyeCommander
    </Typography>;
  }

  const videoConstraints = props.videoConstraints || {};

  return (
    <Webcam
      {...props}
      videoConstraints={{ deviceId: selectedDeviceId, ...videoConstraints }}
    />
  );
};
