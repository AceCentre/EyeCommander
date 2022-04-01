import React, { forwardRef, useCallback, useRef, useState } from "react";
import { CameraWithHighlights } from "./camera-with-highlights.jsx";
import { useStoreValue } from "./hooks/use-store";
import { THROTTLE_TIME_KEY, OPTIONS_OPEN } from "./lib/store-consts";
import { throttle } from "lodash";
import { Box } from "@mui/system";
import { SliderWithValue } from "./slider-with-value.jsx";
import {
  Button,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useBlink } from "./hooks/use-blink";
import { FACEMESH_FACE_OVAL } from "@mediapipe/face_mesh";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useResizer } from "./hooks/use-resizer.js";

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

  const {
    loading: loadingOptionsOpen,
    value: optionsOpen,
    update: updateOptionsOpen,
  } = useStoreValue(OPTIONS_OPEN, "open");

  useResizer({
    width: optionsOpen === "open" || loadingOptionsOpen ? 880 : 550,
    height: optionsOpen === "open" || loadingOptionsOpen ? 440 : 500,
  });

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

  const result = useBlink(throttled);

  console.log(result);

  const { detectBlink, options, displayOnSlider, highlights } = result;

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

  if (loadingOptionsOpen) return null;

  return (
    <Box
      sx={{
        ...sx,
        gap: "2rem",
        display: optionsOpen === "open" ? "grid" : "flex",
      }}
    >
      <Box
        sx={{
          height: "334.25px",
          display: "flex",
          flexDirection: "column",
          minWidth: "389px",
          maxWidth: "389px",
        }}
      >
        <CameraWithHighlights
          distanceHistory={distanceHistory}
          onFrame={onFrame}
          displayOnSlider={displayOnSlider}
          highlights={highlights}
        />
        <Box sx={{ marginTop: "auto" }}>{children}</Box>
      </Box>

      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          padding: "1rem",
          paddingLeft: "0.5rem",
          gap: "0.5rem",
          ...paperSx,
        }}
      >
        <TooltipButton
          TooltipProps={{
            placement: "top",
            title: `${optionsOpen === "open" ? "Hide" : "Show"} options`,
            enterDelay: 500,
          }}
          sx={{ minWidth: "0", padding: 0 }}
          variant="outlined"
          onClick={() => {
            updateOptionsOpen(optionsOpen === "open" ? "closed" : "open");
          }}
        >
          {optionsOpen === "open" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </TooltipButton>
        {optionsOpen === "open" && (
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              flexDirection: "column",
              width: "100%",
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
          </Box>
        )}
      </Paper>
    </Box>
  );
};

const TooltipButton = forwardRef(({ TooltipProps, ...props }, ref) => {
  return (
    <Tooltip {...TooltipProps}>
      <Button ref={ref} {...props} />
    </Tooltip>
  );
});

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
