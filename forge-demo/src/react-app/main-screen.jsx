import React from "react";
import { useResizer } from "./hooks/use-resizer";

export const MainScreen = () => {
  useResizer({ width: 800, height: 600 });

  return <h1>This is the main screen</h1>;
};
