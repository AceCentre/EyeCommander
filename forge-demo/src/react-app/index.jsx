import React from "react";
import { FaceMeshBlinking } from "./face-mesh-blinking.jsx";

const { ipcRenderer } = electronInternals;

export const Home = () => {
  const onClick = (key) => () => {
    ipcRenderer.send("trigger-keypress", key);
  };

  return (
    <div>
      <FaceMeshBlinking />
    </div>
  );
};
