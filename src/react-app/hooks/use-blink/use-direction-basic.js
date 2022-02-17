import { useCallback } from "react";
import { CHANGE_THRESHOLD_BASIC_KEY } from "../../lib/store-consts";
import { useStoreValue } from "../use-store";

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

export const useDirectionBasic = (onBlink) => {
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

          const rightEye = {
            right: landmarks[33],
            left: landmarks[133],
            pupil: rightPupil,
          };

          const leftEye = {
            right: landmarks[362],
            left: landmarks[263],
            pupil: leftPupil,
          };

          const rhDistance = euclaideanDistance(rightEye.right, rightEye.pupil);
          const rvDistance = euclaideanDistance(rightEye.left, rightEye.pupil);

          const lvDistance = euclaideanDistance(leftEye.right, leftEye.pupil);
          const lhDistance = euclaideanDistance(leftEye.left, leftEye.pupil);

          const reRatio = rhDistance / rvDistance;
          const leRatio = lhDistance / lvDistance;

          const ratio = (reRatio + leRatio) / 2;

          const currentFrame = {
            time: currentTimestamp,
            ratio,
          };

          const newThreshold = blinkThreshold / 2;

          distanceHistory.current.push(currentFrame);
          distanceHistory.current.shift();

          if (ratio > newThreshold) {
            onBlink("basic");
          }
        }
      }
    },
    [blinkThreshold, loadingBlinkThreshold, onBlink]
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
