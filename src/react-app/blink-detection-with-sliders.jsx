import React, { useCallback, useRef } from "react";
import { CameraWithHighlights } from "./camera-with-highlights.jsx";
import { useStoreValue } from "./hooks/use-store";
import { THROTTLE_TIME_KEY } from "./lib/store-consts";
import { throttle } from "lodash";
import { Box } from "@mui/system";
import { SliderWithValue } from "./slider-with-value.jsx";
import { Paper } from "@mui/material";
import { useBlink } from "./hooks/use-blink.js";

const KEEP_NUMBER_OF_VALUES = 20;

export const BlinkDetectionWithSliders = ({
  faceInFrame,
  onBlink,
  children,
  sx = {},
  paperSx = {},
}) => {
  const distanceHistory = useRef(
    Array(KEEP_NUMBER_OF_VALUES).fill({ time: Infinity, value: 0 })
  );

  const {
    loading: loadingThrottleTime,
    value: throttleTime,
    update: updateThrottleTime,
  } = useStoreValue(THROTTLE_TIME_KEY, 1000);

  const throttled = useCallback(
    throttle(
      () => {
        if (onBlink) {
          onBlink();
        }
      },
      throttleTime,
      { trailing: false }
    ),
    [throttleTime, onBlink]
  );

  const { detectBlink, options } = useBlink(throttled);

  const onFrame = useCallback(
    (results) => {
      const currentTimestamp = performance.now();

      if (results.multiFaceLandmarks.length === 1 && faceInFrame) {
        faceInFrame(true);
      } else if (faceInFrame) {
        faceInFrame(false);
      }

      detectBlink(results, currentTimestamp, distanceHistory);
    },
    [throttled, faceInFrame, detectBlink]
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
      <CameraWithHighlights
        distanceHistory={distanceHistory}
        onFrame={onFrame}
      />

      <Paper
        sx={{
          display: "flex",
          gap: "1rem",
          flexDirection: "column",
          padding: "1rem",
          ...paperSx,
        }}
      >
        {options.map(({ loadingOption, ...option }) => {
          return loadingOption ? null : (
            <SliderWithValue key={option.label} {...option} />
          );
        })}
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
