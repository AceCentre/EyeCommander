import { Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FaceMesh,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_FACE_OVAL,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_LEFT_IRIS,
} from "@mediapipe/face_mesh";

import { SelectedWebcam } from "./selected-webcam.jsx";
import { useLoading } from "./hooks/use-loading.js";
import { green, red } from "@mui/material/colors";
import { useFaceMesh } from "./hooks/use-face-mesh.js";

export const FaceFramer = ({ nextTask, prevTask }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [allowNext, setAllowNext] = useState(true);
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

    if (results.multiFaceLandmarks.length === 1) {
      setAllowNext(true);
    } else {
      setAllowNext(false);
    }

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
  }

  useFaceMesh({ loading, webcamRef }, onResults);

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
      {!allowNext ? (
        <Box>
          <Typography sx={{ color: red[500] }}>
            We cannot find a face in the window. Try getting closer to the
            webcam or improve the lighting of your face.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography sx={{ color: green[500], fontWeight: "bold" }}>
            We found your face in the frame. Click 'Next step below to
            continues'
          </Typography>
        </Box>
      )}
      <SelectedWebcam sx={{ display: "none" }} webcamRef={webcamRef} />
      <canvas ref={canvasRef} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={prevTask} size="large">
          Previous step
        </Button>
        <Button
          onClick={nextTask}
          disabled={!allowNext}
          size="large"
          variant="contained"
        >
          Next step
        </Button>
      </Box>
    </Paper>
  );
};
