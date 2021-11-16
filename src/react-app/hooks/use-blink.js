import { useCallback } from "react";
import {
  BLINK_MODE,
  CHANGE_THRESHOLD_BASIC_KEY,
  CHANGE_THRESHOLD_SPEED_KEY,
} from "../lib/store-consts";
import { useStoreValue } from "./use-store";

const TIME_BETWEEN = 100;

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

const useBasicBlink = (onBlink) => {
  const {
    loading: loadingBlinkThreshold,
    value: blinkThreshold,
    update: updateBlinkThreshold,
  } = useStoreValue(CHANGE_THRESHOLD_BASIC_KEY, 5);

  const noop = useCallback(
    (results, currentTimestamp, distanceHistory) => {
      if (loadingBlinkThreshold) return;

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

          if (ratio > blinkThreshold) {
            onBlink();
          }
        }
      }
    },
    [blinkThreshold, loadingBlinkThreshold]
  );

  return {
    detectBlink: noop,
    options: [
      {
        loadingOption: loadingBlinkThreshold,
        min: 0,
        max: 100,
        defaultValue: loadingBlinkThreshold ? 0 : blinkThreshold * 10,
        label: "Blink depth",
        tooltip:
          "The higher this more you must close your eyes to trigger a blink",
        onChange: (newValue) => {
          updateBlinkThreshold(newValue / 10);
        },
      },
    ],
  };
};

const useSpeedBlink = (onBlink) => {
  const {
    loading: loadingBlinkThreshold,
    value: blinkThreshold,
    update: updateBlinkThreshold,
  } = useStoreValue(CHANGE_THRESHOLD_SPEED_KEY, 5);

  const noop = useCallback(
    (results, currentTimestamp, distanceHistory) => {
      if (loadingBlinkThreshold) return;

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

          let firstFrame = distanceHistory.current.find(
            (x) => currentTimestamp - x.time < TIME_BETWEEN
          );

          // If we cant get a frame in the right time we just take the last one we took
          if (!firstFrame) {
            firstFrame =
              distanceHistory.current[distanceHistory.current.length - 1];
          }

          distanceHistory.current.push(currentFrame);
          distanceHistory.current.shift();

          const timeChange = currentFrame.time - firstFrame.time;
          const ratioChange = currentFrame.ratio - firstFrame.ratio;
          const totalChange = (ratioChange / timeChange) * 100;

          if (totalChange > blinkThreshold) {
            onBlink();
          }
        }
      }
    },
    [blinkThreshold, loadingBlinkThreshold]
  );

  return {
    detectBlink: noop,
    options: [
      {
        loadingOption: loadingBlinkThreshold,
        min: 0,
        max: 100,
        defaultValue: loadingBlinkThreshold ? 0 : blinkThreshold * 10,
        label: "Blink speed",
        tooltip: "The higher this quicker your blink must be",
        onChange: (newValue) => {
          updateBlinkThreshold(newValue / 10);
        },
      },
    ],
  };
};

export const BLINK_MODES = [
  {
    id: "BASIC",
    title: "Basic",
    description:
      "Tracks the gap between your top eye lid and bottom, detects a blink when it goes below your given threshold",
  },
  {
    id: "SPEED",
    title: "Speed",
    description:
      "Tracks the gap between your eye lids over time and detects a blink if it changes rapidly. Works well if you have a shallow blink",
  },
];

export const useBlink = (...params) => {
  const { loading: blinkModeLoading, value: blinkMode } = useStoreValue(
    BLINK_MODE,
    BLINK_MODES[0].id
  );

  const noop = useCallback(() => {});

  const basic = useBasicBlink(...params);
  const speed = useSpeedBlink(...params);

  if (blinkModeLoading) {
    return { detectBlink: noop, options: [] };
  }

  if (blinkMode === "BASIC") {
    return basic;
  }

  if (blinkMode === "SPEED") {
    return speed;
  }
};
