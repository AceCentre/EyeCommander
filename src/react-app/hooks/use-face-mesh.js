import { useEffect, useState } from "react";

import { FaceMesh } from "@mediapipe/face_mesh";

export const useFaceMesh = ({ loading, webcamRef }, onResults) => {
  const [currentMesh, setCurrentMesh] = useState(null);
  useEffect(() => {
    if (!loading) {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `/public/face/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        refineLandmarks: true,
      });

      faceMesh.onResults(onResults);

      const videoElement = document.getElementById("react-webcam-el");

      const updateFrame = async () => {
        await faceMesh.send({ image: webcamRef.current.video });
        videoElement.requestVideoFrameCallback(updateFrame);
      };

      videoElement.requestVideoFrameCallback(updateFrame);

      setCurrentMesh(faceMesh);
    }
  }, [loading, webcamRef]);

  useEffect(() => {
    if (currentMesh) {
      currentMesh.onResults(onResults);
    }
  }, [onResults]);
};
