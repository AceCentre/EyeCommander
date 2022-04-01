import { useCallback } from "react";
import {
  CHANGE_THRESHOLD_BASIC_KEY,
  BASIC_BLINK_EYE_TO_TRACK,
} from "../../lib/store-consts";
import { useStoreValue } from "../use-store";

const euclaideanDistance = (point, point1) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = point1;
  const distance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
  return distance;
};

export const useBasicBlink = (onBlink, setDisplayOnSlider) => {
  const {
    loading: loadingBlinkThreshold,
    value: blinkThreshold,
    update: updateBlinkThreshold,
  } = useStoreValue(CHANGE_THRESHOLD_BASIC_KEY, 5);

  const {
    loading: loadingEyeToTrack,
    value: eyeToTrack,
    update: updateEyeToTrack,
  } = useStoreValue(BASIC_BLINK_EYE_TO_TRACK, "both");

  const noop = useCallback(
    (results, currentTimestamp, distanceHistory) => {
      if (loadingBlinkThreshold) return;
      if (loadingEyeToTrack) return;

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

          let ratio = null;

          if (eyeToTrack === "both") {
            ratio = (reRatio + leRatio) / 2;
          } else if (eyeToTrack === "right") {
            ratio = reRatio;
          } else if (eyeToTrack === "left") {
            ratio = leRatio;
          } else {
            throw new Error(`Invalid eyeToTrack: ${eyeToTrack}`);
          }

          const currentFrame = {
            time: currentTimestamp,
            ratio,
          };

          distanceHistory.current.push(currentFrame);
          distanceHistory.current.shift();

          if (ratio > blinkThreshold) {
            onBlink("basic");
          }

          setDisplayOnSlider({
            currentValue: Math.min(ratio / 10, 1),
            threshold: blinkThreshold / 10,
          });
        }
      }
    },
    [
      blinkThreshold,
      loadingBlinkThreshold,
      onBlink,
      setDisplayOnSlider,
      loadingEyeToTrack,
      eyeToTrack,
    ]
  );

  const eyesToTrackHighlights = {
    both: { leftEye: true, rightEye: true },
    left: { leftEye: true, rightEye: false },
    right: { leftEye: false, rightEye: true },
  };

  return {
    detectBlink: noop,
    highlights: {
      ...eyesToTrackHighlights[eyeToTrack],
      face: true,
      leftPupil: false,
      rightPupil: false,
      leftEyeEdgePoints: false,
      rightEyeEdgePoints: false,
    },
    options: [
      {
        loadingOption: loadingBlinkThreshold,
        type: "slider",
        min: 0,
        max: 100,
        defaultValue: loadingBlinkThreshold ? 0 : blinkThreshold * 10,
        label: "Blink depth",
        tooltip:
          "The higher this more you must close your eyes to trigger a blink. The current value is shown on the indicator on the left",
        onChange: (newValue) => {
          updateBlinkThreshold(newValue / 10);
        },
      },
      {
        loadingOption: loadingEyeToTrack,
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
        defaultValue: loadingEyeToTrack ? "both" : eyeToTrack,
        label: "Eyes to track",
        tooltip: "Decide which eyes you want to track",
        onChange: (newValue) => {
          updateEyeToTrack(newValue);
        },
      },
    ],
  };
};
