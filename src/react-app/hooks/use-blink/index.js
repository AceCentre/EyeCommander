import { useCallback, useState } from "react";
import { BLINK_MODE } from "../../lib/store-consts";
import { useBasicBlink } from "./use-basic-blink";
import { useDirectionBasic } from "./use-direction-basic";
import { useHoldBlink } from "./use-hold-blink";
import { useSpeedBlink } from "./use-speed-blink";
import { useStoreValue } from "../use-store";
import { useDirectionHold } from "./use-direction-hold";
import { useResizer } from "../use-resizer";

export const BLINK_MODES = [
  {
    id: "HOLD",
    title: "Hold blink",
    description:
      "Triggers when you hold your eyes closed for a given period of time",
  },
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
  {
    id: "DIRECTION_BASIC",
    title: "Left/Right Basic (BETA)",
    description: "Triggers when you look to the left or right.",
  },
  {
    id: "DIRECTION_HOLD",
    title: "Left/Right Hold (BETA)",
    description:
      "Triggers when you look to the left or right for a specified length of time.",
  },
];

const BIGGER_VIEWS = ["DIRECTION_HOLD", "HOLD"];

export const useBlink = (...params) => {
  const { loading: blinkModeLoading, value: blinkMode } = useStoreValue(
    BLINK_MODE,
    BLINK_MODES[0].id
  );

  useResizer({
    width: 900,
    height: !blinkModeLoading && BIGGER_VIEWS.includes(blinkMode) ? 523 : 440,
  });

  const [displayOnSlider, setDisplayOnSlider] = useState({
    currentValue: 0,
    threshold: 0.5,
  });

  const noop = useCallback(() => {});

  const basic = useBasicBlink(...params, setDisplayOnSlider);
  const speed = useSpeedBlink(...params, setDisplayOnSlider);
  const hold = useHoldBlink(...params, setDisplayOnSlider);
  const directionBasic = useDirectionBasic(...params, setDisplayOnSlider);
  const directionHold = useDirectionHold(...params, setDisplayOnSlider);

  if (blinkModeLoading) {
    return { detectBlink: noop, options: [] };
  }

  if (blinkMode === "BASIC") {
    return { ...basic, displayOnSlider };
  }

  if (blinkMode === "SPEED") {
    return { ...speed, displayOnSlider };
  }

  if (blinkMode === "HOLD") {
    return { ...hold, displayOnSlider };
  }

  if (blinkMode === "DIRECTION_BASIC") {
    return { ...directionBasic, displayOnSlider };
  }

  if (blinkMode === "DIRECTION_HOLD") {
    return { ...directionHold, displayOnSlider };
  }
};
