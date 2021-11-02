import { useEffect } from "react";

import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

export const useFaceMesh = ({ loading, webcamRef }, onResults) => {
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
      });

      faceMesh.onResults(onResults);

      new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
      }).start();
    }
  }, [loading, onResults]);
};
