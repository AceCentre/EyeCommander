import numpy as np
import cv2

def drawROI_frame(mask, ROI, frame):
    # This draws the polygon onto the mask and then computes a bitwise 'and' so we now have only the eye and black pixels
    cv2.polylines(mask, [ROI], True, 255, 2)
    cv2.fillPoly(mask, [ROI], 255)
    ROI_frame = cv2.bitwise_and(frame, frame, mask=mask)
    return ROI_frame

def extract_ROI_frame(ROI, ROI_frame):
    # Now we take the maximums and minimums from the ROI array in both x and y so that we can get only the needed information
    # in the next frame, this time without any unwanted information like 0's or other parts of the frame
    min_x, max_x, min_y, max_y = np.min(ROI[:, 0]), np.max(ROI[:, 0]), np.min(ROI[:, 1]), np.max(ROI[:, 1])
    extracted_ROI = ROI_frame[min_y: max_y, min_x: max_x]
    extracted_ROI = cv2.resize(extracted_ROI, (50, 30), interpolation = cv2.INTER_AREA)
    return extracted_ROI

def Isolate_ROI(ROI_points, frame):
    # Extracts the dimensions of the frame
    height, width = frame.shape
    # Creates a numpy array with the coordinates of the eye
    ROI = np.array(ROI_points, np.int32)
    # This creates a mask filled with 0's
    mask = np.zeros((height, width), np.uint8)

    ROI_frame = drawROI_frame(mask, ROI, frame)
    Isolated_ROI = extract_ROI_frame(ROI, ROI_frame)

    # Using adaptiveThreshold here to make it easier to find countours and later track the eye with the countours
    Isolated_ROI = cv2.adaptiveThreshold(Isolated_ROI, 255, cv2.ADAPTIVE_THRESH_MEAN_C,\
                   cv2.THRESH_BINARY_INV,11,2)
    return Isolated_ROI