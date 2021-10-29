import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Webcam from "react-webcam";
import { useCamera } from "./hooks/use-camera";
import { useAnimationFrame } from "./hooks/use-request-animation-frame";
import { useStaticFaceMesh } from "./hooks/use-static-face-mesh";
import { useWebcamSelector } from "./hooks/use-webcam-selector";

const LOADING_TIME = 5000;
const FPS_LIMIT = 30;

export const DebugView = () => {
  const webcamRef = useRef(null);
  const openCvRawRef = useRef(null);
  const [count, setCount] = useState(0);
  const videoCapture = useCamera(webcamRef);
  const [facemeshInstance, setFacemeshInstance] = useState(null);
  const [loading, setLoading] = useState(true);

  const { devices, selectedDeviceId, setDeviceId } = useWebcamSelector();

  const { faceMeshInstance, leftEyeCanvasRef, rightEyeCanvasRef } =
    useStaticFaceMesh(openCvRawRef);

  useEffect(() => {
    setTimeout(() => setLoading(false), LOADING_TIME);
  }, []);

  if (loading) {
    return <p>Loading.....</p>;
  }

  if (devices.length === 0) {
    return <p>No webcams found</p>;
  }

  return (
    <>
      <select
        onChange={(event) => {
          setDeviceId(event.target.value);
        }}
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
      <p>Frame Counter: {count}</p>
      <Webcam
        height={450}
        width={600}
        ref={webcamRef}
        videoConstraints={{ deviceId: selectedDeviceId }}
      />
      {videoCapture.camera && faceMeshInstance && (
        <TransformInput
          videoCapture={videoCapture}
          setCount={setCount}
          openCvRawRef={openCvRawRef}
          faceMeshInstance={faceMeshInstance}
        />
      )}
      <canvas ref={openCvRawRef} />
      <canvas ref={leftEyeCanvasRef} height={450} width={600} />
      <canvas ref={rightEyeCanvasRef} height={450} width={600} />
    </>
  );
};

const TransformInput = ({
  videoCapture,
  setCount,
  openCvRawRef,
  faceMeshInstance,
}) => {
  useAnimationFrame((deltaTime) => {
    setCount((prevCount) => prevCount + 1);

    const capture = videoCapture.getFrame();
    cv.imshow(openCvRawRef.current, capture);

    faceMeshInstance.send({ image: openCvRawRef.current });
  }, FPS_LIMIT);

  return <></>;
};
