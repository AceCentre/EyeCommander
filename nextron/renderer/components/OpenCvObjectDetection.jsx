import { useEffect, useRef, useState } from "react";
import { useOpenCv } from "./OpenCvProvider";
import Webcam from "react-webcam";

const createFileFromUrl = function (url) {
  return new Promise((resolve) => {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function (ev) {
      if (request.readyState === 4) {
        if (request.status === 200) {
          let data = new Uint8Array(request.response);
          resolve(data);
          // cv.FS_createDataFile("/", path, data, true, false, false);
          // callback();
        } else {
          self.printError(
            "Failed to load " + url + " status: " + request.status
          );
        }
      }
    };
    request.send();
  });
};

export const OpenCvObjectDetection = () => {
  const { loaded, cv } = useOpenCv();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [haarFile, setHaarFile] = useState(null);

  useEffect(async () => {
    const buffer = await createFileFromUrl(
      "haarcascade_frontalface_default.xml"
    );
    setHaarFile(buffer);
  }, []);

  useEffect(() => {
    if (
      loaded &&
      cv &&
      webcamRef &&
      webcamRef.current &&
      webcamRef.current.video &&
      haarFile &&
      canvasRef &&
      canvasRef.current &&
      canvasRef.current.id
    ) {
      cv.FS_createDataFile(
        "/",
        "haarcascade_frontalface_default.xml",
        haarFile,
        true,
        false,
        false
      );

      const video = webcamRef.current.video;
      let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      let gray = new cv.Mat();
      let cap = new cv.VideoCapture(video);
      let faces = new cv.RectVector();
      let classifier = new cv.CascadeClassifier();
      classifier.load("haarcascade_frontalface_default.xml");
      const FPS = 30;

      const processVideo = () => {
        let begin = Date.now();
        // start processing.
        cap.read(src);
        src.copyTo(dst);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
        // // detect faces.
        classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
        // // draw faces.
        for (let i = 0; i < faces.size(); ++i) {
          let face = faces.get(i);
          let point1 = new cv.Point(face.x, face.y);
          let point2 = new cv.Point(face.x + face.width, face.y + face.height);
          cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
        }

        cv.imshow(canvasRef.current.id, dst);
        // schedule the next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
      };

      // schedule the first one.
      setTimeout(processVideo, 0);
    }
  }, [loaded, cv, webcamRef]);

  return (
    <>
      <Webcam
        audio={false}
        height={240}
        ref={webcamRef}
        width={320}
        videoConstraints={{
          width: 320,
          height: 240,
          facingMode: "user",
        }}
      />
      <canvas
        ref={canvasRef}
        id="canvasOutput"
        width="320"
        height="240"
      ></canvas>{" "}
    </>
  );
};
