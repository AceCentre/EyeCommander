import { useCallback, useState } from "react";
import { BLINK_MODE } from "../../lib/store-consts";
import { useBasicBlink } from "./use-basic-blink";
import { useDirectionBasic } from "./use-direction-basic";
import { useHoldBlink } from "./use-hold-blink";
import { useSpeedBlink } from "./use-speed-blink";
import { useStoreValue } from "../use-store";
import { useDirectionHold } from "./use-direction-hold";

export const BLINK_MODES = [
  {
    id: "HOLD",
    title: "Hold blink (<strong>Recommended<strong>)",
    description:
      "Triggers when you hold your eyes closed for a given period of time",
  },
  {
    id: "BASIC",
    title: "Basic",
    description:
      "Triggers as soon as your eyes close. This mode will detect involuntary blinks so is <strong>not recommended.</strong>",
  },
  {
    id: "SPEED",
    title: "Speed",
    description:
      "Tracks the speed that your eye opens and closes. <strong>Not recommended</strong> as it will miss deliberate blinks.",
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

export const useBlink = (...params) => {
  const { loading: blinkModeLoading, value: blinkMode } = useStoreValue(
    BLINK_MODE,
    BLINK_MODES[0].id
  );

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
