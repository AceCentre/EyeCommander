export const BLINK_MODES = [
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
];

export const useBlink = () => {
  return { onBlink: () => {}, reload: () => {} };
};
