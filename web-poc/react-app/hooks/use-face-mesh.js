import { useEffect, useState } from "react";

import { FaceMesh } from "@mediapipe/face_mesh";

const useForceRerender = () => {
  const [counter, setCounter] = useState(0);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const timeout = setInterval(() => {
      setCounter((x) => x + 1);
    }, 1000);
    setTimer(timeout);

    return () => {
      clearInterval(timeout);
    };
  }, []);

  return {
    counter,
    stop: () => {
      clearInterval(timer);
    },
  };
};

export const useFaceMesh = ({ loading, webcamRef }, onResults) => {
  const [currentMesh, setCurrentMesh] = useState(null);
  const [videoElement, setVideoElement] = useState(null);
  const { counter, stop } = useForceRerender();

  useEffect(() => {
    if (!videoElement) {
      const current = document.getElementById("react-webcam-el");

      if (current) {
        setVideoElement(current);
        stop();
      }
    }
  }, [counter, counter]);

  useEffect(() => {
    if (!loading && videoElement) {
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

      const updateFrame = async () => {
        await faceMesh.send({ image: webcamRef.current.video });
        videoElement.requestVideoFrameCallback(updateFrame);
      };

      videoElement.requestVideoFrameCallback(updateFrame);

      setCurrentMesh(faceMesh);
    }
  }, [loading, webcamRef, videoElement]);

  useEffect(() => {
    if (currentMesh) {
      currentMesh.onResults(onResults);
    }
  }, [onResults]);
};
