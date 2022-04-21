import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([{ client: "Chrome" }]);
function testSupport(supportedDevices) {
  const deviceDetector = new DeviceDetector();
  const detectedDevice = deviceDetector.parse(navigator.userAgent);
  let isSupported = false;
  for (const device of supportedDevices) {
    if (device.client !== undefined) {
      const re = new RegExp(`^${device.client}$`);
      if (!re.test(detectedDevice.client.name)) {
        continue;
      }
    }
    if (device.os !== undefined) {
      const re = new RegExp(`^${device.os}$`);
      if (!re.test(detectedDevice.os.name)) {
        continue;
      }
    }
    isSupported = true;
    break;
  }
  if (!isSupported) {
    alert(
      `This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
        "is not well supported at this time, continue at your own risk."
    );
  }
}
const controls = window;
const drawingUtils = window;
const mpFaceMesh = window;
const config = {
  locateFile: (file) => {
    return (
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@" +
      `${mpFaceMesh.VERSION}/${file}`
    );
  },
};
// Our input frames will come from here.
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const controlsElement = document.getElementsByClassName("control-panel")[0];
const canvasCtx = canvasElement.getContext("2d");
/**
 * Solution options.
 */
const solutionOptions = {
  selfieMode: true,
  enableFaceGeometry: false,
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector(".loading");
spinner.ontransitionend = () => {
  spinner.style.display = "none";
};
function onResults(results) {
  // Hide the spinner.
  document.body.classList.add("loaded");
  // Update the frame rate.
  fpsControl.tick();
  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        mpFaceMesh.FACEMESH_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        mpFaceMesh.FACEMESH_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        mpFaceMesh.FACEMESH_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        mpFaceMesh.FACEMESH_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        mpFaceMesh.FACEMESH_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        mpFaceMesh.FACEMESH_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        canvasCtx,
        landmarks,
        mpFaceMesh.FACEMESH_LIPS,
        { color: "#E0E0E0" }
      );
      if (solutionOptions.refineLandmarks) {
        drawingUtils.drawConnectors(
          canvasCtx,
          landmarks,
          mpFaceMesh.FACEMESH_RIGHT_IRIS,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          canvasCtx,
          landmarks,
          mpFaceMesh.FACEMESH_LEFT_IRIS,
          { color: "#30FF30" }
        );
      }
    }
  }
  canvasCtx.restore();
}
const faceMesh = new mpFaceMesh.FaceMesh(config);
faceMesh.setOptions(solutionOptions);
faceMesh.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls.ControlPanel(controlsElement, solutionOptions)
  .add([
    new controls.StaticText({ title: "MediaPipe Face Mesh" }),
    fpsControl,
    new controls.Toggle({ title: "Selfie Mode", field: "selfieMode" }),
    new controls.SourcePicker({
      onFrame: async (input, size) => {
        const aspect = size.height / size.width;
        let width, height;
        if (window.innerWidth > window.innerHeight) {
          height = window.innerHeight;
          width = height / aspect;
        } else {
          width = window.innerWidth;
          height = width * aspect;
        }
        canvasElement.width = width;
        canvasElement.height = height;
        await faceMesh.send({ image: input });
      },
    }),
    new controls.Slider({
      title: "Max Number of Faces",
      field: "maxNumFaces",
      range: [1, 4],
      step: 1,
    }),
    new controls.Toggle({
      title: "Refine Landmarks",
      field: "refineLandmarks",
    }),
    new controls.Slider({
      title: "Min Detection Confidence",
      field: "minDetectionConfidence",
      range: [0, 1],
      step: 0.01,
    }),
    new controls.Slider({
      title: "Min Tracking Confidence",
      field: "minTrackingConfidence",
      range: [0, 1],
      step: 0.01,
    }),
  ])
  .on((x) => {
    const options = x;
    videoElement.classList.toggle("selfie", options.selfieMode);
    faceMesh.setOptions(options);
  });
