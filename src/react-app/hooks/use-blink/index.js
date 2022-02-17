import { useCallback } from "react";
import { BLINK_MODE } from "../../lib/store-consts";
import { useBasicBlink } from "./use-basic-blink";
import { useDirectionBasic } from "./use-direction-basic";
import { useHoldBlink } from "./use-hold-blink";
import { useSpeedBlink } from "./use-speed-blink";
import { useStoreValue } from "../use-store";

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
    title: "Left/Right Basic",
    description: "Triggers when you look to the left or right.",
  },
];

export const useBlink = (...params) => {
  const { loading: blinkModeLoading, value: blinkMode } = useStoreValue(
    BLINK_MODE,
    BLINK_MODES[0].id
  );

  const noop = useCallback(() => {});

  const basic = useBasicBlink(...params);
  const speed = useSpeedBlink(...params);
  const hold = useHoldBlink(...params);
  const directionBasic = useDirectionBasic(...params);

  if (blinkModeLoading) {
    return { detectBlink: noop, options: [] };
  }

  if (blinkMode === "BASIC") {
    return basic;
  }

  if (blinkMode === "SPEED") {
    return speed;
  }

  if (blinkMode === "HOLD") {
    return hold;
  }

  if (blinkMode === "DIRECTION_BASIC") {
    return directionBasic;
  }
};
