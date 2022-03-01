import { useCallback } from "react";
import {
  DIRECTION_BASIC,
  DIRECTION_DEPTH_BASIC_KEY,
  WHICH_EYES,
} from "../../lib/store-consts";
import { useStoreValue } from "../use-store";

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

export const useDirectionBasic = (onBlink, setDisplayOnSlider) => {
  const {
    loading: loadingDirectionDepth,
    value: directionDepth,
    update: updateDirectionDepth,
  } = useStoreValue(DIRECTION_DEPTH_BASIC_KEY, 5);

  const {
    loading: loadingWhichEyes,
    value: whichEyes,
    update: updateWhichEyes,
  } = useStoreValue(WHICH_EYES, "both");

  const {
    loading: loadingDirection,
    value: direction,
    update: updateDirection,
  } = useStoreValue(DIRECTION_BASIC, "left");

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

          const rhDistance = euclaideanDistance(rightEye.right, rightEye.pupil);
          const rvDistance = euclaideanDistance(rightEye.left, rightEye.pupil);

          const lvDistance = euclaideanDistance(leftEye.right, leftEye.pupil);
          const lhDistance = euclaideanDistance(leftEye.left, leftEye.pupil);

          const reRatio = rhDistance / rvDistance;
          const leRatio = lhDistance / lvDistance;

          let ratio = 0;

          if (whichEyes === "left") {
            ratio = leRatio;
          } else if (whichEyes === "right") {
            ratio = reRatio;
          } else if (whichEyes === "both") {
            ratio = (reRatio + leRatio) / 2;
          } else {
            throw new Error("We dont know which eyes to use: " + whichEyes);
          }

          const currentFrame = {
            time: currentTimestamp,
            ratio,
          };

          const newThreshold = directionDepth / 2;

          distanceHistory.current.push(currentFrame);
          distanceHistory.current.shift();

          if (ratio > newThreshold) {
            onBlink("basic");
          }

          setDisplayOnSlider({
            currentValue: Math.min(ratio / 5, 1),
            threshold: newThreshold / 5,
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
    ]
  );

  return {
    detectBlink: noop,
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
        tooltip: "The distance you have to move your eye to trigger the blink",
        onChange: (newValue) => {
          updateDirectionDepth(newValue / 10);
        },
      },
    ],
  };
};
