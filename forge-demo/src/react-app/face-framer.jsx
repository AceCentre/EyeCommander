import { Button, Paper } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FaceMesh,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_FACE_OVAL,
} from "@mediapipe/face_mesh";

import { SelectedWebcam } from "./selected-webcam.jsx";
import { useLoading } from "./hooks/use-loading.js";

export const FaceFramer = ({ nextTask, prevTask }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const loading = useLoading(500);

  function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
        });

        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
          color: "#30FF30",
        });

        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
          color: "#ffffff",
        });
      }
    }

    canvasCtx.restore();
  }

  useEffect(() => {
    if (!loading) {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `/public/face/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onResults);

      new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
      }).start();
    }
  }, [loading]);

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
      <SelectedWebcam sx={{ display: "none" }} webcamRef={webcamRef} />
      <canvas ref={canvasRef} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={prevTask} size="large">
          Previous step
        </Button>
        <Button onClick={nextTask} disabled size="large" variant="contained">
          Next step
        </Button>
      </Box>
    </Paper>
  );
};
