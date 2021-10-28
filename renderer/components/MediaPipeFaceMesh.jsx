import { useEffect, useRef } from "react";

const solutionOptions = {
  selfieMode: true,
  enableFaceGeometry: false,
  maxNumFaces: 1,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

export const MediaPipeFaceMesh = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const controlsRef = useRef();

  useEffect(() => {
    if (
      videoRef.current &&
      canvasRef.current &&
      controlsRef.current &&
      window &&
      window.FPS &&
      window.drawConnectors &&
      window.FACEMESH_TESSELATION &&
      window.ControlPanel &&
      window.VERSION
    ) {
      const asyncSetup = async () => {
        await new Promise((res) => setTimeout(res, 10000));
        console.log("waited");

        const canvasCtx = canvasRef.current.getContext("2d");
        const fpsControl = new FPS();
        const canvasElement = canvasRef.current;
        const controlsElement = controlsRef.current;
        const videoElement = videoRef.current;

        const onResults = (results) => {
          // Hide the spinner.
          // document.body.classList.add("loaded");

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
              drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
                color: "#C0C0C070",
                lineWidth: 1,
              });
              drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
                color: "#FF3030",
              });
              drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
                color: "#FF3030",
              });
              drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
                color: "#30FF30",
              });
              drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
                color: "#30FF30",
              });
              drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
                color: "#E0E0E0",
              });
              drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {
                color: "#E0E0E0",
              });
              if (solutionOptions.refineLandmarks) {
                drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
                  color: "#FF3030",
                });
                drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
                  color: "#30FF30",
                });
              }
            }
          }
          canvasCtx.restore();
        };
        const config = {
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        };
        const faceMesh = new FaceMesh(config);
        faceMesh.setOptions(solutionOptions);
        faceMesh.onResults(onResults);

        // Present a control panel through which the user can manipulate the solution
        // options.
        new ControlPanel(controlsElement, solutionOptions)
          .add([
            new StaticText({ title: "MediaPipe Face Mesh" }),
            fpsControl,
            new Toggle({ title: "Selfie Mode", field: "selfieMode" }),
            new SourcePicker({
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
            new Slider({
              title: "Max Number of Faces",
              field: "maxNumFaces",
              range: [1, 4],
              step: 1,
            }),
            new Toggle({
              title: "Refine Landmarks",
              field: "refineLandmarks",
            }),
            new Slider({
              title: "Min Detection Confidence",
              field: "minDetectionConfidence",
              range: [0, 1],
              step: 0.01,
            }),
            new Slider({
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
      };
      asyncSetup();
    }
  }, [videoRef, canvasRef, controlsRef]);

  return (
    <div>
      <video ref={videoRef} className="input_video"></video>
      <canvas
        ref={canvasRef}
        className="output_canvas"
        width="1280px"
        height="720px"
      ></canvas>
      <div ref={controlsRef} />
    </div>
  );
};

/* <div class="container">
<video class="input_video"></video>
<div class="canvas-container">
<canvas class="output_canvas" width="1280px" height="720px">
</canvas>
</div>
<div class="loading">
  <div class="spinner"></div>
  <div class="message">
    Loading
  </div>
</div>
<a class="abs logo" href="http://www.mediapipe.dev" target="_blank">
  <div style="display: flex;align-items: center;bottom: 0;right: 10px;">
    <img class="logo" src="logo_white.png" alt="" style="
      height: 50px;">
    <span class="title">MediaPipe</span>
  </div>
</a>
<div class="shoutout">
  <div>
    <a href="https://solutions.mediapipe.dev/face_mesh">
      Click here for more info
    </a>
  </div>
</div>
</div>
<div class="control-panel">
</div> */

// @keyframes spin {
//     0% {
//       transform: rotate(0deg);
//     }
//     100% {
//       transform: rotate(360deg);
//     }
//   }

//   .abs {
//     position: absolute;
//   }

//   a {
//     color: white;
//     text-decoration: none;
//     &:hover {
//       color: lightblue;
//     }
//   }

//   body {
//     bottom: 0;
//     font-family: 'Titillium Web', sans-serif;
//     color: white;
//     left: 0;
//     margin: 0;
//     position: absolute;
//     right: 0;
//     top: 0;
//     transform-origin: 0px 0px;
//     overflow: hidden;
//   }

//   .container {
//     position: absolute;
//     background-color: #596e73;
//     width: 100%;
//     max-height: 100%;
//   }

//   .input_video {
//     display: none;
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     &.selfie {
//       transform: scale(-1, 1);
//     }
//   }

//   .input_image {
//     position: absolute;
//   }

//   .canvas-container {
//     display:flex;
//     height: 100%;
//     width: 100%;
//     justify-content: center;
//     align-items:center;
//   }

//   .output_canvas {
//     max-width: 100%;
//     display: block;
//     position: relative;
//     left: 0;
//     top: 0;
//   }

//   .logo {
//     bottom: 10px;
//     right: 20px;

//     .title {
//       color: white;
//       font-size: 28px;
//     }

//     .subtitle {
//       position: relative;
//       color: white;
//       font-size: 10px;
//       left: -30px;
//       top: 20px;
//     }
//   }

//   .control-panel {
//     position: absolute;
//     left: 10px;
//     top: 10px;
//   }

//   .loading {
//     display: flex;
//     position: absolute;
//     top: 0;
//     right: 0;
//     bottom: 0;
//     left: 0;
//     align-items: center;
//     backface-visibility: hidden;
//     justify-content: center;
//     opacity: 1;
//     transition: opacity 1s;

//     .message {
//       font-size: x-large;
//     }

//     .spinner {
//       position: absolute;
//       width: 120px;
//       height: 120px;
//       animation: spin 1s linear infinite;
//       border: 32px solid #bebebe;
//       border-top: 32px solid #3498db;
//       border-radius: 50%;
//     }
//   }

//   .loaded .loading {
//     opacity: 0;
//   }

//   .shoutout {
//     left: 0;
//     right: 0;
//     bottom: 40px;
//     text-align: center;
//     font-size: 24px;
//     position: absolute;
//   }

// const controls = window;
// const drawingUtils = window;
// const mpFaceMesh = window;

// const config = {locateFile: (file) => {
//   return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@` +
//          `${VERSION}/${file}`;
// }};

// // Our input frames will come from here.
// const videoElement =
//     document.getElementsByClassName('input_video')[0] as HTMLVideoElement;
// const canvasElement =
//     document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement;
// const controlsElement =
//     document.getElementsByClassName('control-panel')[0] as HTMLDivElement;
// const canvasCtx = canvasElement.getContext('2d')!;

// /**
//  * Solution options.
//  */

// // We'll add this to our control panel later, but we'll save it here so we can
// // call tick() each time the graph runs.
// const fpsControl = new controls.FPS();

// // Optimization: Turn off animated spinner after its hiding animation is done.
// const spinner = document.querySelector('.loading')! as HTMLDivElement;
// spinner.ontransitionend = () => {
//   spinner.style.display = 'none';
// };

// function onResults(results: mpFaceMesh.Results): void {
//   // Hide the spinner.
//   document.body.classList.add('loaded');

//   // Update the frame rate.
//   fpsControl.tick();

//   // Draw the overlays.
//   canvasCtx.save();
//   canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//   canvasCtx.drawImage(
//       results.image, 0, 0, canvasElement.width, canvasElement.height);
//   if (results.multiFaceLandmarks) {
//     for (const landmarks of results.multiFaceLandmarks) {
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_TESSELATION,
//           {color: '#C0C0C070', lineWidth: 1});
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_EYE,
//           {color: '#FF3030'});
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_EYEBROW,
//           {color: '#FF3030'});
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_EYE,
//           {color: '#30FF30'});
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_EYEBROW,
//           {color: '#30FF30'});
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_FACE_OVAL,
//           {color: '#E0E0E0'});
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_LIPS, {color: '#E0E0E0'});
//            if (solutionOptions.refineLandmarks) {
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_IRIS,
//           {color: '#FF3030'});
//       drawingUtils.drawConnectors(
//           canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_IRIS,
//           {color: '#30FF30'});
//       }
//     }
//   }
//   canvasCtx.restore();
// }

// const faceMesh = new mpFaceMesh.FaceMesh(config);
// faceMesh.setOptions(solutionOptions);
// faceMesh.onResults(onResults);

// // Present a control panel through which the user can manipulate the solution
// // options.
// new controls
//     .ControlPanel(controlsElement, solutionOptions)
//     .add([
//       new controls.StaticText({title: 'MediaPipe Face Mesh'}),
//       fpsControl,
//       new controls.Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
//       new controls.SourcePicker({
//         onFrame:
//             async (input: controls.InputImage, size: controls.Rectangle) => {
//               const aspect = size.height / size.width;
//               let width: number, height: number;
//               if (window.innerWidth > window.innerHeight) {
//                 height = window.innerHeight;
//                 width = height / aspect;
//               } else {
//                 width = window.innerWidth;
//                 height = width * aspect;
//               }
//               canvasElement.width = width;
//               canvasElement.height = height;
//               await faceMesh.send({image: input});
//             },
//       }),
//       new controls.Slider({
//         title: 'Max Number of Faces',
//         field: 'maxNumFaces',
//         range: [1, 4],
//         step: 1
//       }),
//       new controls.Toggle(
//         {title: 'Refine Landmarks', field: 'refineLandmarks'}),
//       new controls.Slider({
//         title: 'Min Detection Confidence',
//         field: 'minDetectionConfidence',
//         range: [0, 1],
//         step: 0.01
//       }),
//       new controls.Slider({
//         title: 'Min Tracking Confidence',
//         field: 'minTrackingConfidence',
//         range: [0, 1],
//         step: 0.01
//       }),
//     ])
//     .on(x => {
//       const options = x as mpFaceMesh.Options;
//       videoElement.classList.toggle('selfie', options.selfieMode);
//       faceMesh.setOptions(options);
//     });
