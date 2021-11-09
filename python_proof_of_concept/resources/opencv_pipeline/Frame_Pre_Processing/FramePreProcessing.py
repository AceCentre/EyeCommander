import cv2
import numpy as np

# This is a contrast based histogram equalization, using this we can have a better contrast between our grayscale values
# The equalization is done by blocks, that is every 8x8 block is equalized, but that would increase noise if there is noise
# to avoid some of it we use the clipLimit, so if the histogram bin is higher than the clipLimit we distribute it's value uniformly
# to the other bins before equalization.
def CLAHE(frame, clipLimit = 3.0, tileGridSize = (8,8)):
	if clipLimit > 255:
		clipLimit = 255
	elif tileGridSize[1] > frame.shape[1] or tileGridSize[0] > frame.shape[0]:
		tileGridSize = (frame.shape[1], frame.shape[0])
	elif clipLimit < 0:
		clipLimit = 0
	elif tileGridSize[1] <= 0 or tileGridSize[0] <= 0:
		tileGridSize = (1, 1)
	clahe = cv2.createCLAHE(clipLimit, tileGridSize)
	CLAHEFrame = clahe.apply(frame)
	return CLAHEFrame

# The blur function is to get a better detail quality each blur has a purpose, median usually is good with cleaning up
# noise but distorts the image while gaussian is better at preserving the edges it isn't as effective with noise.
def blur(EqFrame, kernelSize = 7, blurType = 0):
	if kernelSize % 2 == 0:
		kernelSize = kernelSize + 1
	elif 0 <= kernelSize <= 2:
		kernelSize = 3
	if (blurType == 0):
		blurredFrame = cv2.GaussianBlur(EqFrame,(kernelSize, kernelSize), 0)
	elif (blurType == 1):
		blurredFrame = cv2.medianBlur(EqFrame, kernelSize)
	elif(blurType > 1 or blurType < 0):
		blurredFrame = cv2.GaussianBlur(EqFrame,(kernelSize, kernelSize), 0)
	return blurredFrame

# Just flips the image horizontaly and converts to Grayscale
def initialAdjustments(frame):
	grayFrame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
	return grayFrame

# When we normalize the image we are "stretching" the histogram and correcting some of the bad light in it,
# then we use a histogram euqalization in the entire image, after that we procced to a tile based contrast
# histogram equalization, that is a histogram equalization of a W x H of a given number of pixels with that
# our bad light conditions as well as the contrast are better and the grayscale image has more details in it
def correctLighting(grayFrame, clipLimit, tileGridSize):
	if len(grayFrame.shape) > 2:
		grayFrame = initialAdjustments(grayFrame)
	h, w = grayFrame.shape
	norm = np.zeros((w, h))
	normalizedFrame = cv2.normalize(grayFrame, norm, 0, 255, cv2.NORM_MINMAX)
	EqFrame = cv2.equalizeHist(normalizedFrame)
	CLAHEFrame = CLAHE(EqFrame, clipLimit, tileGridSize)
	return CLAHEFrame

# In the end we use a blur to both clean some of the noise we might have as well as smooth our edges so its easier
# to detect them and finally we can threshold the frame to better visualize the edges, if needed
def preProcess(frame, clipLimit, tileGridSize, kernelSize, blurType, threshold = False):
	adjustedFrame = initialAdjustments(frame)
	correctedFrame = correctLighting(adjustedFrame, clipLimit, tileGridSize)
	outputFrame = blur(correctedFrame, kernelSize, blurType)
	if threshold == True:
		outputFrame = cv2.adaptiveThreshold(outputFrame,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,\
					cv2.THRESH_BINARY,11,2)
	return outputFrame 