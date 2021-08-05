import cv2

# This will find the contours in the frame and then sort it out so we get the biggest one on the first position for the tracking
def extractCountours(eye):
    contours, _ = cv2.findContours(eye, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key = lambda x: cv2.contourArea(x), reverse = True)

    return contours

# The function draws a bounding box and two lines inside the box, so where the lines cross would be the
# approximate center of the contour
# TODO: can be done in a better way with the circles function instead of the one implemented but since it's
# only so we can see and the center is already being tracked I did not implement it
def drawTrackingFigures(eye, cnt, rows, cols, center):
    (x, y, w, h) = cv2.boundingRect(cnt)
    cX, cY = center
    cv2.drawContours(eye, [cnt], -1, (0, 0, 255), 3)
    cv2.rectangle(eye, (x, y), (x + w, y + h), (255, 0, 0), 1)
    cv2.line(eye, (cX, 0), (cX, rows), (0, 255, 0), 1)
    cv2.line(eye, (0, cY), (cols, cY), (0, 255, 0), 1)

# If an approximate visual representation of what is happening is needed just switch drawFigures to True
def eyeCenterTracking(eye, drawFigures = False):

    contours = extractCountours(eye)

    if(drawFigures):
        rows, cols = eye.shape

    for cnt in contours:
        # The moments function is implemented on opencv and when the following operations are computed with
        # the returned points we can find the center coordinates of any given contour    
        M = cv2.moments(cnt)
        center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))
        area = cv2.contourArea(cnt)
        if (drawFigures):
            drawTrackingFigures(eye, cnt, rows, cols, center)
        break
    return area, center, eye