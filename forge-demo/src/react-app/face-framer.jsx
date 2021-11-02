import { Paper } from "@mui/material";
import React from "react";
import { SelectedWebcam } from "./selected-webcam.jsx";

export const FaceFramer = ({ nextTask }) => {
  return (
    <Paper
      sx={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "90%",
        margin: "0 auto",
        maxWidth: "540px",
      }}
    >
      <SelectedWebcam />
    </Paper>
  );
};
