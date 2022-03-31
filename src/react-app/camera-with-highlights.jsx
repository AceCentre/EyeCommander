import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLoading } from "./hooks/use-loading";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  FACEMESH_FACE_OVAL,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
} from "@mediapipe/face_mesh";
import { useFaceMesh } from "./hooks/use-face-mesh";
import { FPS } from "@mediapipe/control_utils";
import { SelectedWebcam } from "./selected-webcam.jsx";
import { useStoreValue } from "./hooks/use-store";
import { REVERSE_CAMERA } from "./lib/store-consts";
import { CircularProgress, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";

const LOADING_TIME = 2000;

const DEFAULT_HIGHLIGHTS = {
  leftEye: true,
  rightEye: true,
  face: true,
  leftPupil: true,
  rightPupil: true,
  leftEyeEdgePoints: true,
  rightEyeEdgePoints: true,
};

export const CameraWithHighlights = ({
  onFrame = () => {},
  displayOnSlider = null,
  highlights = DEFAULT_HIGHLIGHTS,
}) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const displayOnSliderRef = useRef();
  const loading = useLoading(LOADING_TIME);
  const [fpsCounter, setFpsCounter] = useState(null);

  useEffect(() => {
    const newCounter = new FPS();

    // Pretty major hack so I don't have to attach
    // a canvas because then i lose control over styling
    newCounter.j = {
      canvas: {},
      clearRect: () => {},
      fillRect: () => {},
      setLineDash: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
    };

    newCounter.h = {};

    setFpsCounter(newCounter);
  }, []);

  displayOnSliderRef.current = displayOnSlider;

  const { value: reverse, loading: reverseLoading } = useStoreValue(
    REVERSE_CAMERA,
    true
  );

  const canvasFlip = reverse ? { transform: "scale(-1,1)" } : {};

  const onResults = useCallback(
    (results) => {
      if (fpsCounter) {
        fpsCounter.tick();
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

      const paddingFromSides = 32;
      const distanceBetweenEndsOfLine =
        canvasElement.width - paddingFromSides * 2;

      if (reverse) {
        /**
         * Background line
         */
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 8;
        canvasCtx.strokeStyle = "white";
        canvasCtx.moveTo(
          canvasElement.width - paddingFromSides,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.lineTo(
          paddingFromSides,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.stroke();

        /**
         * Line to show where you are currently
         */
        const endOfGreenLinePoint =
          canvasElement.width -
          distanceBetweenEndsOfLine * displayOnSliderRef.current.currentValue -
          paddingFromSides;
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 8;
        canvasCtx.strokeStyle = "#30FF30";
        canvasCtx.moveTo(
          canvasElement.width - paddingFromSides,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.lineTo(
          endOfGreenLinePoint,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.stroke();

        /** Threshold line */
        canvasCtx.beginPath();
        const thresholdMarkerPoint =
          canvasElement.width -
          paddingFromSides -
          distanceBetweenEndsOfLine * displayOnSliderRef.current.threshold;

        canvasCtx.lineWidth = 4;
        canvasCtx.strokeStyle = "#FF3030";
        canvasCtx.moveTo(
          thresholdMarkerPoint,
          canvasElement.height - paddingFromSides - 20
        );
        canvasCtx.lineTo(
          thresholdMarkerPoint,
          canvasElement.height - paddingFromSides + 20
        );
        canvasCtx.stroke();
      } else {
        /**
         * Background line
         */
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 8;
        canvasCtx.strokeStyle = "white";
        canvasCtx.moveTo(
          canvasElement.width - paddingFromSides,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.lineTo(
          paddingFromSides,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.stroke();

        /**
         * Line to show where you are currently
         */
        const endOfGreenLinePoint =
          distanceBetweenEndsOfLine * displayOnSliderRef.current.currentValue +
          paddingFromSides;
        canvasCtx.beginPath();
        canvasCtx.lineWidth = 8;
        canvasCtx.strokeStyle = "#30FF30";
        canvasCtx.moveTo(
          paddingFromSides,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.lineTo(
          endOfGreenLinePoint,
          canvasElement.height - paddingFromSides
        );
        canvasCtx.stroke();

        /** Threshold line */
        canvasCtx.beginPath();
        const thresholdMarkerPoint =
          paddingFromSides +
          distanceBetweenEndsOfLine * displayOnSliderRef.current.threshold;

        canvasCtx.lineWidth = 4;
        canvasCtx.strokeStyle = "#FF3030";
        canvasCtx.moveTo(
          thresholdMarkerPoint,
          canvasElement.height - paddingFromSides - 20
        );
        canvasCtx.lineTo(
          thresholdMarkerPoint,
          canvasElement.height - paddingFromSides + 20
        );
        canvasCtx.stroke();
      }

      onFrame(results);

      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          const leftPupil = {
            x:
              (landmarks[474].x +
                landmarks[475].x +
                landmarks[476].x +
                landmarks[477].x) /
              4,
            y:
              (landmarks[474].y +
                landmarks[475].y +
                landmarks[476].y +
                landmarks[477].y) /
              4,
          };

          const rightPupil = {
            x:
              (landmarks[469].x +
                landmarks[470].x +
                landmarks[471].x +
                landmarks[472].x) /
              4,
            y:
              (landmarks[469].y +
                landmarks[470].y +
                landmarks[471].y +
                landmarks[472].y) /
              4,
          };

          if (highlights.face) {
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
              color: "#ffffff",
            });
          }

          if (highlights.leftEye) {
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
              color: "#30FF30",
            });
          }

          if (highlights.rightEye) {
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
              color: "#FF3030",
            });
          }

          if (highlights.leftPupil) {
            drawLandmarks(canvasCtx, [leftPupil], {
              color: "#30FF30",
              radius: 1,
            });
          }

          if (highlights.rightPupil) {
            drawLandmarks(canvasCtx, [rightPupil], {
              color: "#FF3030",
              radius: 1,
            });
          }

          if (highlights.rightEyeEdgePoints) {
            drawLandmarks(canvasCtx, [landmarks[33], landmarks[133]], {
              color: "#FF3030",
              radius: 1,
            });
          }

          if (highlights.leftEyeEdgePoints) {
            drawLandmarks(canvasCtx, [landmarks[362], landmarks[263]], {
              color: "#30FF30",
              radius: 1,
            });
          }
        }
      }

      canvasCtx.restore();
    },
    [onFrame, displayOnSliderRef, reverse, reverseLoading, fpsCounter]
  );

  useFaceMesh({ loading: loading || reverseLoading, webcamRef }, onResults);

  return (
    <Box sx={{ position: "relative" }}>
      <SelectedWebcam sx={{ display: "none" }} webcamRef={webcamRef} />
      <Box sx={{ position: "absolute", zIndex: 99, padding: "1rem" }}>
        <Typography
          sx={{ color: "white", fontSize: "1rem", fontWeight: "bold" }}
        >
          Frame Rate:{" "}
          {(fpsCounter && fpsCounter.h && fpsCounter.h.textContent) ||
            "Loading"}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "291px",
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

      <Box
        style={{
          position: "absolute",
          zIndex: 100,
          height: "100%",
          width: "100%",
          maxHeight: "295px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tooltip
          title="Use the slider on the right to change the threshold value"
          arrow
          followCursor
          enterDelay={300}
        >
          <Box style={{ marginTop: "auto", height: "100px" }}></Box>
        </Tooltip>
      </Box>

      <canvas
        style={{
          ...canvasFlip,
          width: "100%",
          maxHeight: "480px",
          position: "relative",
        }}
        ref={canvasRef}
      ></canvas>
    </Box>
  );
};
