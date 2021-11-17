import React, { useCallback, useRef, useState } from "react";
import { useLoading } from "./hooks/use-loading";
import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FACEMESH_FACE_OVAL,
  FACEMESH_LEFT_IRIS,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_IRIS,
} from "@mediapipe/face_mesh";
import { useFaceMesh } from "./hooks/use-face-mesh";
import { SelectedWebcam } from "./selected-webcam.jsx";
import { useStoreValue } from "./hooks/use-store";
import { REVERSE_CAMERA } from "./lib/store-consts";
import { CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";

const LOADING_TIME = 2000;

export const CameraWithHighlights = ({
  onFrame = () => {},
  distanceHistory = { current: [] },
}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const loading = useLoading(LOADING_TIME);
  const [frameRate, setFrameRate] = useState(0);

  const { value: reverse, loading: reverseLoading } = useStoreValue(
    REVERSE_CAMERA,
    false
  );

  const canvasFlip = reverse ? { transform: "scale(-1,1)" } : {};

  const onResults = useCallback(
    (results) => {
      const firstFrame = distanceHistory.current[0];
      const lastFrame =
        distanceHistory.current[distanceHistory.current.length - 1];

      if (
        firstFrame &&
        lastFrame &&
        firstFrame.time !== Infinity &&
        lastFrame.time !== Infinity
      ) {
        const gap = lastFrame.time - firstFrame.time;
        const numberOfFrames = distanceHistory.current.length;
        const newFrameRate = Math.floor((numberOfFrames / gap) * 1000);

        setFrameRate(newFrameRate);
      }

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

      onFrame(results);

      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
            color: "#FF3030",
          });

          drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
            color: "#FF3030",
          });

          drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
            color: "#30FF30",
          });

          drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
            color: "#30FF30",
          });

          drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
            color: "#ffffff",
          });
        }
      }

      canvasCtx.restore();
    },
    [onFrame]
  );

  useFaceMesh({ loading: loading || reverseLoading, webcamRef }, onResults);

  return (
    <Box sx={{ position: "relative" }}>
      <SelectedWebcam sx={{ display: "none" }} webcamRef={webcamRef} />
      <Box sx={{ position: "absolute", zIndex: 99, padding: "1rem" }}>
        <Typography
          sx={{ color: "white", fontSize: "1rem", fontWeight: "bold" }}
        >
          Frame Rate: {frameRate}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          background: "white",

          boxShadow:
            "0px 2px 1px -1px rgb(0  0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        }}
      >
        <CircularProgress />
      </Box>

      <canvas
        style={{
          ...canvasFlip,
          width: "100%",
          height: "100%",
          position: "relative",
        }}
        ref={canvasRef}
      ></canvas>
    </Box>
  );
};
