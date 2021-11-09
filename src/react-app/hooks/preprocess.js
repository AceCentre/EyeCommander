export const preprocess = (img) => {
  cv.cvtColor(img, img, cv.COLOR_BGR2GRAY);
  cv.GaussianBlur(img, img, { width: 5, height: 5 }, cv.BORDER_DEFAULT);
  cv.resize(img, img, { width: 63, height: 35 });

  return img;
};
