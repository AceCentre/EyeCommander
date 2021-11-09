import { useEffect, useState } from "react";

export const useCamera = (webcamRef) => {
  const [camera, setCamera] = useState(null);
  const [source, setSource] = useState(null);

  useEffect(() => {
    const { video } = webcamRef.current || {};

    if (cv && webcamRef && webcamRef.current && video && camera === null) {
      const videoCapture = new cv.VideoCapture(video);
      let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);

      setCamera(videoCapture);
      setSource(src);
    }
  });

  const getFrame = () => {
    if (!camera) {
      throw new Error("Camera is not ready");
    }

    camera.read(source);

    return source;
  };

  return { camera, getFrame };
};
