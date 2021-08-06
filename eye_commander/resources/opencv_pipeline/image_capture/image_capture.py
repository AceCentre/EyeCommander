'''Image Capture Module

The scope of this module is to detect built in cameras, capture the video feed from the one to
use, check camera capabilities (resolution and fps) and pass frames to the Image Processing Module
at a standard predetermined rate, handling possible exceptions in case of a malfunction.

First Iteration Requirements:
1. Capture video feed from the default system camera
2. Check video feed fps rate
3. Pass frames at max 20fps
4. Ability to return or save the frames

Module Settings:
FPS_LIMIT: Maximum framerate in frames-per-seconds
OUTPUT_MODE: 1 to display output, 2 to save output in ./frames/
'''

import os
import time
import cv2

# Module settings
FPS_LIMIT = 20
OUTPUT_MODE = 1

# Used for the FPS limiter
start_time = time.time()
frame_count = 0 # pylint: disable=invalid-name

# Open capturing device
# TODO: Ability to switch device based on calibration results
cap = cv2.VideoCapture(0)

# Get camera framerate and log to console
FRAME_RATE = int(cap.get(cv2.CAP_PROP_FPS))
print('Camera FPS:', FRAME_RATE)

while cap.isOpened():
    # Capture frame-by-frame
    success, frame = cap.read()

    # Stop if no video input
    if not success:
        break

    # Display camera output
    cv2.imshow('CAM Output', frame)

    # FPS limiter
    current_time = time.time()
    if (current_time - start_time) > (1 / FPS_LIMIT):
        if OUTPUT_MODE == 1:
            cv2.imshow('ICM Output', frame) # Display module output
        elif OUTPUT_MODE == 2:
            if not os.path.exists('frames'):
                os.makedirs('frames') # Create ./frames if it does not exist
            cv2.imwrite('frames/frame%d.jpg' % frame_count, frame) # Save frame as JPEG file
            print('Saved frame:', frame_count)
            frame_count += 1
        start_time = time.time() # Reset time

    # Wait for a key event
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# When everything done, release the capture
cap.release()
cv2.destroyAllWindows()
