import { Avatar, Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useRef, useState } from "react";
import { green, red } from "@mui/material/colors";
import { useSound } from "use-sound";

import { throttle } from "lodash";
import { SliderWithValue } from "./slider-with-value.jsx";
import { useStoreValue } from "./hooks/use-store.js";
import {
  CHANGE_THRESHOLD_KEY,
  INITIAL_SETUP_REQUIRED,
  THROTTLE_TIME_KEY,
} from "./lib/store-consts.js";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CameraWithHighlights } from "./camera-with-highlights.jsx";

const KEEP_NUMBER_OF_VALUES = 100;
const TIME_BETWEEN = 100;

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

export const BlinkTraining = ({ prevTask, forceReload }) => {
  const { update: updateInitialSetup } = useStoreValue(
    INITIAL_SETUP_REQUIRED,
    true
  );
  const [blinkCount, setBlinkCount] = useState(0);
  const distanceHistory = useRef(
    Array(KEEP_NUMBER_OF_VALUES).fill({ time: Infinity, value: 0 })
  );
  const [allowNext, setAllowNext] = useState(true);
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

  const onFrame = useCallback(
    (results) => {
      const currentTimestamp = performance.now();

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
        }
      }
    },
    [blinkThreshold, throttled]
  );

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
      <CameraWithHighlights onFrame={onFrame} />
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
          onClick={() => {
            updateInitialSetup(false);
            forceReload();
          }}
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
