import * as tf from "@tensorflow/tfjs";

const getTensor = (img) => {
  const outputCanvas = document.createElement("canvas");
  cv.imshow(outputCanvas, img);
  return tf.browser.fromPixels(outputCanvas).toFloat().expandDims(0).toFloat();
};

export const predict = (leftEye, rightEye, model) => {
  const outputCanvas = document.createElement("canvas");
  cv.imshow(outputCanvas, leftEye);

  const left = getTensor(leftEye);
  const right = getTensor(rightEye);

  const batch = tf.concat([left, right], 0);

  const result = model.predict(batch);

  console.log({ left, right, batch, result });

  // const newCanvas = new Canvas()

  // console.log("Prediction begin", {
  //   leftEye,
  //   rightEye,
  //   matFuncs: Object.getOwnPropertyNames(leftEye),
  // });

  // const leftTensor = tf.tensor4d(leftEye.data, [
  //   1,
  //   leftEye.rows,
  //   leftEye.cols,
  //   3,
  // ]);
  // const leftFloat = leftEye["data32F"];
  // const leftCast = tf.cast(leftFloat, "float32");
  // const leftExpanded = tf.expandDims(leftTensor, 0);

  // const rightTensor = tf.tensor4d(rightEye.data, [
  //   1,
  //   rightEye.rows,
  //   rightEye.cols,
  //   3,
  // ]);
  // const rightFloat = rightEye["data32F"];
  // const rightCast = tf.cast(rightFloat, "float32");
  // const rightExpanded = tf.expandDims(rightTensor, 0);

  // console.log({
  //   leftCast,
  //   rightCast,
  //   leftExpanded,
  //   rightExpanded,
  //   leftFloat,
  //   rightFloat,
  //   leftTensor,
  //   rightTensor,
  // });
  // const batch = tf.concat([leftExpanded, rightExpanded]);

  // # add batch dimension for tensorflow
  // left = np.expand_dims(eyes[0], 0)
  // right = np.expand_dims(eyes[1], 0)

  // # combine left/right back into one batch
  // batch = np.concatenate([left,right])

  // console.log({ batch });
  // const result = model.predict(batch);

  // console.log("Prediction end", { leftExpanded, rightExpanded, result });
};
