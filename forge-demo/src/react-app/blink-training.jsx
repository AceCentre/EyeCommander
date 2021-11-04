import {
  Avatar,
  Button,
  LinearProgress,
  Paper,
  Slider,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useSound } from "use-sound";

import { throttle } from "lodash";
import { SliderWithValue } from "./slider-with-value.jsx";
import { useStoreValue } from "./hooks/use-store.js";
import { CHANGE_THRESHOLD_KEY, THROTTLE_TIME_KEY } from "./lib/store-consts.js";
import VisibilityIcon from "@mui/icons-material/Visibility";

const CHANGE_THRESHOLD = 8;
const KEEP_NUMBER_OF_VALUES = 100;
const TIME_BETWEEN = 100;
const THROTTLE_TIME = 1000;

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

const getColorProp = (blinkCount, iconNumber) => {
  if (blinkCount >= iconNumber) {
    return { backgroundColor: green[500] };
  }
  return {};
};

const min = 0;
const max = 10;
const normaliseProgress = (value) =>
  Math.floor(((value - min) * 100) / (max - min));

export const BlinkTraining = ({ nextTask, prevTask }) => {
  const [blinkCount, setBlinkCount] = useState(0);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const distanceHistory = useRef(
    Array(KEEP_NUMBER_OF_VALUES).fill({ time: Infinity, value: 0 })
  );
  const [allowNext, setAllowNext] = useState(true);
  const loading = useLoading(500);
  const [play] = useSound("./public/notif.mp3");

  const {
    loading: loadingBlinkThreshold,
    value: blinkThreshold,
    update: updateBlinkThreshold,
  } = useStoreValue(CHANGE_THRESHOLD_KEY, 5);
  const {
    loading: loadingThrottleTime,
    value: throttleTime,
    update: updateThrottleTime,
  } = useStoreValue(THROTTLE_TIME_KEY, 1000);

  const throttled = useCallback(
    throttle(() => {
      play();
      setBlinkCount((x) => x + 1);
    }, throttleTime),
    [throttleTime, play]
  );

  const onResults = useCallback(
    (results) => {
      const currentTimestamp = performance.now();

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
          const rightEye = {
            right: landmarks[33],
            left: landmarks[133],
            top: landmarks[159],
            bottom: landmarks[145],
          };

          const leftEye = {
            right: landmarks[362],
            left: landmarks[263],
            top: landmarks[386],
            bottom: landmarks[374],
          };

          const rhDistance = euclaideanDistance(rightEye.right, rightEye.left);
          const rvDistance = euclaideanDistance(rightEye.top, rightEye.bottom);

          const lvDistance = euclaideanDistance(leftEye.top, leftEye.bottom);
          const lhDistance = euclaideanDistance(leftEye.right, leftEye.left);

          const reRatio = rhDistance / rvDistance;
          const leRatio = lhDistance / lvDistance;

          const ratio = (reRatio + leRatio) / 2;

          const currentFrame = {
            time: currentTimestamp,
            ratio,
          };

          distanceHistory.current.push(currentFrame);
          distanceHistory.current.shift();

          const firstFrame = distanceHistory.current.find(
            (x) => currentTimestamp - x.time < TIME_BETWEEN
          );

          const timeChange = currentFrame.time - firstFrame.time;
          const ratioChange = currentFrame.ratio - firstFrame.ratio;
          const totalChange = (ratioChange / timeChange) * 100;

          if (totalChange > blinkThreshold) {
            throttled();
          }

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
    [loading, blinkThreshold, throttled]
  );

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
          <Typography>
            Adjust the sliders below to make sure it can reliably detect your
            blink. There will be a sound played every time a blink is detected.
          </Typography>
        </Box>
      )}
      <Box>
        <Typography>
          To finish setup you must register at least 4 blinks.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            margin: "1rem 0",
          }}
        >
          <Avatar
            sx={{ width: 56, height: 56, ...getColorProp(blinkCount, 1) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
          <Avatar
            sx={{ width: 56, height: 56, ...getColorProp(blinkCount, 2) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
          <Avatar
            sx={{ width: 56, height: 50, ...getColorProp(blinkCount, 3) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
          <Avatar
            sx={{ width: 56, height: 56, ...getColorProp(blinkCount, 4) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
        </Box>
      </Box>
      <SelectedWebcam sx={{ display: "none" }} webcamRef={webcamRef} />
      <canvas ref={canvasRef} />
      <Box sx={{ display: "grid", gap: "1rem", flexDirection: "column" }}>
        {!loadingBlinkThreshold && (
          <SliderWithValue
            min={0}
            max={100}
            defaultValue={blinkThreshold * 10}
            label="Blink depth"
            tooltip="The higher this value the more clear you blink must be"
            onChange={(newValue) => {
              updateBlinkThreshold(newValue / 10);
            }}
          />
        )}
        {!loadingThrottleTime && (
          <SliderWithValue
            min={100}
            max={10000}
            defaultValue={throttleTime}
            label="Throttle time"
            tooltip="The minimum amount of time between blinks."
            onChange={(newValue) => {
              updateThrottleTime(newValue);
            }}
          />
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={prevTask} size="large">
          Previous step
        </Button>
        <Button
          onClick={nextTask}
          disabled={!allowNext || blinkCount < 4}
          size="large"
          variant="contained"
        >
          Finish setup
        </Button>
      </Box>
    </Paper>
  );
};
