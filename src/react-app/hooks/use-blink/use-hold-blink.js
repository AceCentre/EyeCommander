import { useCallback } from "react";
import {
  BLINK_LENGTH_KEY,
  CHANGE_THRESHOLD_HOLD_KEY,
} from "../../lib/store-consts";
import { useStoreValue } from "../use-store";

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

export const useHoldBlink = (onBlink) => {
  const {
    loading: loadingBlinkThreshold,
    value: blinkThreshold,
    update: updateBlinkThreshold,
  } = useStoreValue(CHANGE_THRESHOLD_HOLD_KEY, 5);

  const {
    loading: loadingBlinkLength,
    value: blinkLength,
    update: updateBlinkLength,
  } = useStoreValue(BLINK_LENGTH_KEY, 500);

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

          const ratiosInTime = distanceHistory.current
            .filter((frame) => {
              return currentTimestamp - frame.time < blinkLength;
            })
            .map((frame) => frame.ratio);

          const lowestRatio = Math.min(...ratiosInTime);

          if (lowestRatio > blinkThreshold) {
            console.log("Triggering blink hold", {
              lowestRatio,
              ratiosInTime,
              blinkThreshold,
            });
            onBlink("hold");
          }
        }
      }
    },
    [
      blinkThreshold,
      loadingBlinkThreshold,
      loadingBlinkLength,
      blinkLength,
      onBlink,
    ]
  );

  return {
    detectBlink: noop,
    options: [
      {
        loadingOption: loadingBlinkThreshold,
        type: "slider",
        min: 0,
        max: 100,
        defaultValue: loadingBlinkThreshold ? 0 : blinkThreshold * 10,
        label: "Blink threshold",
        tooltip: "The higher this quicker your blink must be",
        onChange: (newValue) => {
          updateBlinkThreshold(newValue / 10);
        },
      },
      {
        loadingOption: loadingBlinkLength,
        type: "slider",
        min: 100,
        max: 2000,
        defaultValue: loadingBlinkLength ? 0 : blinkLength,
        label: "Blink length",
        tooltip:
          "The amount of time in MS you must keep your eyes closed for to trigger a blink",
        onChange: (newValue) => {
          updateBlinkLength(newValue);
        },
      },
    ],
  };
};
