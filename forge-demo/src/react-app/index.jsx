import React from "react";
import FaceMeshComponent from "./face-mesh.jsx";
import { OpenCvObjectDetection } from "./open-cv.jsx";

const { ipcRenderer } = electronInternals;

export const Home = () => {
  const onClick = (key) => () => {
    ipcRenderer.send("trigger-keypress", key);
  };

  return (
    <div>
      <h1>My Home</h1>
      <button onClick={onClick("up")}>Click Me To Send Button Click</button>
      <OpenCvObjectDetection />
      <FaceMeshComponent />
    </div>
  );
};
