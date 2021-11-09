import React, { useEffect, useState } from "react";
import {
  FaceMesh,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYE,
} from "@mediapipe/face_mesh";
import { predict } from "./predict";
import { preprocess } from "./preprocess";
import * as tf from "@tensorflow/tfjs";

const getBoxAroundLandmark = (
  LANDMARK_LIST,
  realLandmarks,
  { width, height }
) => {
  const allCoords = LANDMARK_LIST.flatMap((current) => [
    realLandmarks[current[0]],
    realLandmarks[current[1]],
  ]);

  const yCoords = allCoords.map((x) => x.y);
  const xCoords = allCoords.map((x) => x.x);

  const topLeft = {
    x: Math.min(...xCoords) * width,
    y: Math.min(...yCoords) * height,
  };

  const bottomRight = {
    x: Math.max(...xCoords) * width,
    y: Math.max(...yCoords) * height,
  };

  return { topLeft, bottomRight };
};

export const useStaticFaceMesh = (openCvRawRef) => {
  const [staticFaceMesh, setStaticFaceMesh] = useState(null);
  const leftEyeCanvasRef = React.useRef(null);
  const rightEyeCanvasProcessedRef = React.useRef(null);
  const leftEyeCanvasProcessedRef = React.useRef(null);
  const rightEyeCanvasRef = React.useRef(null);

  const [model, setModel] = useState(null);

  useEffect(async () => {
    const loadedModel = await tf.loadLayersModel("/public/model.json");
    setModel(loadedModel);
  }, []);

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `/public/face/${file}`;
      },
    });

    faceMesh.setOptions({
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      maxNumFaces: 1,
      enableFaceGeometry: true,
    });

    faceMesh.initialize();

    setStaticFaceMesh(faceMesh);
  }, []);

  useEffect(() => {
    if (!staticFaceMesh) return;

    staticFaceMesh.onResults((results) => {
      const firstFaceLandmarks = results.multiFaceLandmarks[0];
      const firstFaceGeometry = results.multiFaceGeometry[0];

      if (!firstFaceLandmarks || !firstFaceGeometry) {
        console.log("No face in frame");
        return;
      }

      const leftEyeBox = getBoxAroundLandmark(
        FACEMESH_LEFT_EYE,
        firstFaceLandmarks,
        results.image
      );

      const rightEyeBox = getBoxAroundLandmark(
        FACEMESH_RIGHT_EYE,
        firstFaceLandmarks,
        results.image
      );

      let rawFrame = cv.imread(openCvRawRef.current);

      let leftDestination = new cv.Mat();
      let leftRect = new cv.Rect(
        leftEyeBox.topLeft.x,
        leftEyeBox.topLeft.y,
        leftEyeBox.bottomRight.x - leftEyeBox.topLeft.x,
        leftEyeBox.bottomRight.y - leftEyeBox.topLeft.y
      );
      leftDestination = rawFrame.roi(leftRect);
      cv.imshow(leftEyeCanvasRef.current, leftDestination);

      let rightDestination = new cv.Mat();
      let rightRect = new cv.Rect(
        leftEyeBox.topLeft.x,
        leftEyeBox.topLeft.y,
        leftEyeBox.bottomRight.x - leftEyeBox.topLeft.x,
        leftEyeBox.bottomRight.y - leftEyeBox.topLeft.y
      );
      rightDestination = rawFrame.roi(rightRect);
      cv.imshow(rightEyeCanvasRef.current, rightDestination);

      const leftProcessed = preprocess(leftDestination);
      const rightProcessed = preprocess(rightDestination);

      cv.imshow(rightEyeCanvasProcessedRef.current, rightProcessed);
      cv.imshow(leftEyeCanvasProcessedRef.current, leftProcessed);

      predict(leftProcessed, rightProcessed, model);
    });
  }, [staticFaceMesh, model]);

  return {
    faceMeshInstance: staticFaceMesh,
    leftEyeCanvasRef,
    rightEyeCanvasRef,
    leftEyeCanvasProcessedRef,
    rightEyeCanvasProcessedRef,
  };
};
