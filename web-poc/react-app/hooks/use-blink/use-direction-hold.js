import { useCallback } from "react";
import {
  DIRECTION_DEPTH_HOLD_KEY,
  WHICH_EYES_HOLD,
  DIRECTION_HOLD,
  DIRECTION_LENGTH_KEY,
} from "../../lib/store-consts";
import { useStoreValue } from "../use-store";

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

export const useDirectionHold = (onBlink, setDisplayOnSlider) => {
  const {
    loading: loadingDirectionDepth,
    value: directionDepth,
    update: updateDirectionDepth,
  } = useStoreValue(DIRECTION_DEPTH_HOLD_KEY, 5);

  const {
    loading: loadingWhichEyes,
    value: whichEyes,
    update: updateWhichEyes,
  } = useStoreValue(WHICH_EYES_HOLD, "both");

  const {
    loading: loadingDirection,
    value: direction,
    update: updateDirection,
  } = useStoreValue(DIRECTION_HOLD, "left");

  const {
    loading: loadingDirectionLength,
    value: directionLength,
    update: updateDirectionLength,
  } = useStoreValue(DIRECTION_LENGTH_KEY, 500);

  const noop = useCallback(
    (results, currentTimestamp, distanceHistory) => {
      if (loadingDirectionDepth || loadingWhichEyes || loadingDirection) return;

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

          const leftEyeToLeft = euclaideanDistance(leftEye.left, leftEye.pupil);
          const leftEyeToRight = euclaideanDistance(
            leftEye.right,
            leftEye.pupil
          );

          const rightEyeToLeft = euclaideanDistance(
            rightEye.left,
            rightEye.pupil
          );
          const rightEyeToRight = euclaideanDistance(
            rightEye.right,
            rightEye.pupil
          );

          let eyesToLeft = 0;
          let eyesToRight = 0;

          if (whichEyes === "left") {
            eyesToLeft = leftEyeToLeft;
            eyesToRight = leftEyeToRight;
          } else if (whichEyes === "right") {
            eyesToLeft = rightEyeToLeft;
            eyesToRight = rightEyeToRight;
          } else if (whichEyes === "both") {
            eyesToLeft = (rightEyeToLeft + leftEyeToLeft) / 2;
            eyesToRight = (rightEyeToRight + leftEyeToRight) / 2;
          } else {
            throw new Error("We dont know which eyes to use: " + whichEyes);
          }

          let ratio;

          if (direction === "left") {
            ratio = eyesToRight / eyesToLeft;
          } else if (direction === "right") {
            ratio = eyesToLeft / eyesToRight;
          } else {
            throw new Error(
              "We dont know which direction you want: " + direction
            );
          }

          const currentFrame = {
            time: currentTimestamp,
            ratio: ratio * 2,
          };

          const newThreshold = directionDepth;

          distanceHistory.current.push(currentFrame);
          distanceHistory.current.shift();

          const ratiosInTime = distanceHistory.current
            .filter((frame) => {
              return currentTimestamp - frame.time < directionLength;
            })
            .map((frame) => frame.ratio);

          const lowestRatio = Math.min(...ratiosInTime);

          if (lowestRatio > newThreshold) {
            console.log("Triggering direction hold", {
              lowestRatio,
              ratiosInTime,
              newThreshold,
            });
            onBlink("hold");
          }

          setDisplayOnSlider({
            currentValue: Math.min((ratio * 2) / 10, 1),
            threshold: newThreshold / 10,
          });
        }
      }
    },
    [
      directionDepth,
      loadingDirectionDepth,
      onBlink,
      whichEyes,
      loadingWhichEyes,
      direction,
      loadingDirection,
      setDisplayOnSlider,
      loadingDirectionLength,
      directionLength,
    ]
  );

  const eyesToTrackHighlights = {
    both: {
      leftPupil: true,
      rightPupil: true,
      leftEyeEdgePoints: true,
      rightEyeEdgePoints: true,
    },
    left: {
      leftPupil: true,
      rightPupil: false,
      leftEyeEdgePoints: true,
      rightEyeEdgePoints: false,
    },
    right: {
      leftPupil: false,
      rightPupil: true,
      leftEyeEdgePoints: false,
      rightEyeEdgePoints: true,
    },
  };

  return {
    detectBlink: noop,
    highlights: {
      leftEye: false,
      rightEye: false,
      face: true,
      ...eyesToTrackHighlights[whichEyes],
    },
    options: [
      {
        type: "sidebyside",
        options: [
          {
            loadingOption: loadingWhichEyes,
            type: "radio",
            options: [
              {
                value: "both",
                name: "Both",
                tooltip: "Detects both eyes",
              },
              {
                value: "left",
                name: "Left",
                tooltip: "Detects only the left eye",
              },
              {
                value: "right",
                name: "Right",
                tooltip: "Detects only the right eye",
              },
            ],
            defaultValue: loadingWhichEyes ? "both" : whichEyes,
            label: "Eyes to track",
            tooltip: "Decide which eyes you want to track",
            onChange: (newValue) => {
              updateWhichEyes(newValue);
            },
          },
          {
            loadingOption: loadingDirection,
            type: "radio",
            options: [
              {
                value: "left",
                name: "Left",
                tooltip: "Detects when you look to the left",
              },
              {
                value: "right",
                name: "Right",
                tooltip: "Detects when you look to the right",
              },
            ],
            defaultValue: loadingDirection ? "left" : direction,
            label: "Direction",
            tooltip: "Decide which direction you want to look",
            onChange: (newValue) => {
              updateDirection(newValue);
            },
          },
        ],
      },
      {
        loadingOption: loadingDirectionDepth,
        type: "slider",
        min: 0,
        max: 100,
        defaultValue: loadingDirectionDepth ? 0 : directionDepth * 10,
        label: "Direction depth",
        tooltip:
          "The distance you have to move your eye to trigger the blink. The current value is shown on the indicator on the left",
        onChange: (newValue) => {
          updateDirectionDepth(newValue / 10);
        },
      },
      {
        loadingOption: loadingDirectionLength,
        type: "slider",
        min: 100,
        max: 2000,
        defaultValue: loadingDirectionLength ? 0 : directionLength,
        label: "Look length",
        tooltip:
          "The amount of time in MS you must keep your eyes looking in the given direction",
        onChange: (newValue) => {
          updateDirectionLength(newValue);
        },
      },
    ],
  };
};
