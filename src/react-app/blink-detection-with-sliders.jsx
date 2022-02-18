import React, { forwardRef, useCallback, useRef, useState } from "react";
import { CameraWithHighlights } from "./camera-with-highlights.jsx";
import { useStoreValue } from "./hooks/use-store";
import { THROTTLE_TIME_KEY } from "./lib/store-consts";
import { throttle } from "lodash";
import { Box } from "@mui/system";
import { SliderWithValue } from "./slider-with-value.jsx";
import {
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useBlink } from "./hooks/use-blink";
import { FACEMESH_FACE_OVAL } from "@mediapipe/face_mesh";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const KEEP_NUMBER_OF_VALUES = 20;
const OVAL_LANDMARKS = [...new Set(FACEMESH_FACE_OVAL.flat())];

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
        const face = results.multiFaceLandmarks[0];
        const flatCoords = [
          ...OVAL_LANDMARKS.map((x) => face[x].x),
          ...OVAL_LANDMARKS.map((x) => face[x].y),
        ];

        const biggest = Math.max(...flatCoords);
        const smallest = Math.min(...flatCoords);

        if (smallest < 0) {
          faceInFrame(false);
        } else if (biggest > 1) {
          faceInFrame(false);
        } else {
          faceInFrame(true);
          detectBlink(results, currentTimestamp, distanceHistory);
        }
      } else if (faceInFrame) {
        faceInFrame(false);
      }
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
            <Option key={option.label} {...option} />
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

const TooltipToggleButton = forwardRef(({ TooltipProps, ...props }, ref) => {
  return (
    <Tooltip {...TooltipProps}>
      <ToggleButton ref={ref} {...props} />
    </Tooltip>
  );
});

const RadioGroup = ({ options, defaultValue, onChange, label, tooltip }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <Box sx={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
      <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Typography>{label}</Typography>
        {tooltip && (
          <Tooltip placement="top" title={tooltip}>
            <HelpOutlineIcon />
          </Tooltip>
        )}
      </Box>
      <ToggleButtonGroup
        color="primary"
        value={value}
        exclusive
        onChange={(event) => {
          setValue(event.target.value);
          onChange(event.target.value);
        }}
      >
        {options.map((option) => (
          <TooltipToggleButton
            TooltipProps={{
              placement: "top",
              title: option.tooltip,
              enterDelay: 500,
            }}
            key={option.value}
            value={option.value}
          >
            {option.name}
          </TooltipToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

const Option = ({ type, ...option }) => {
  if (type === "slider") {
    return <SliderWithValue {...option} />;
  }

  if (type === "radio") {
    return <RadioGroup {...option} />;
  }

  if (type === "sidebyside") {
    if (option.options.length !== 2) {
      throw new Error("Sidebyside requires two options");
    }

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Option {...option.options[0]} />
        <Option {...option.options[1]} />
      </Box>
    );
  }

  throw new Error("Used option type thats not supported: " + type);
};
