import React, { useCallback, useRef } from "react";
import { CameraWithHighlights } from "./camera-with-highlights.jsx";
import { useStoreValue } from "./hooks/use-store";
import { CHANGE_THRESHOLD_KEY, THROTTLE_TIME_KEY } from "./lib/store-consts";
import { throttle } from "lodash";
import { Box } from "@mui/system";
import { SliderWithValue } from "./slider-with-value.jsx";
import { Paper } from "@mui/material";

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

const KEEP_NUMBER_OF_VALUES = 20;
const TIME_BETWEEN = 100;

export const BlinkDetectionWithSliders = ({
  faceInFrame,
  onBlink,
  children,
  sx = {},
}) => {
  const distanceHistory = useRef(
    Array(KEEP_NUMBER_OF_VALUES).fill({ time: Infinity, value: 0 })
  );

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
      if (onBlink) {
        onBlink();
      }
    }, throttleTime),
    [throttleTime, onBlink]
  );

  const onFrame = useCallback(
    (results) => {
      const currentTimestamp = performance.now();

      if (results.multiFaceLandmarks.length === 1 && faceInFrame) {
        faceInFrame(true);
      } else if (faceInFrame) {
        faceInFrame(false);
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
        }
      }
    },
    [blinkThreshold, throttled, faceInFrame]
  );
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        ...sx,
      }}
    >
      <CameraWithHighlights onFrame={onFrame} />

      <Paper
        sx={{
          display: "grid",
          gap: "1rem",
          flexDirection: "column",
          padding: "1rem",
        }}
      >
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
        {children}
      </Paper>
    </Box>
  );
};
