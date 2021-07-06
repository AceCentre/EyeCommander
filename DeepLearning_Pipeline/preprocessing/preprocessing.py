import cv2
import numpy as np

def process_eye_images(frame, left_coords, right_coords):
    eye_left_crop = frame[left_coords[1]-50:left_coords[1]+35, left_coords[0]-50:left_coords[0]+50]
    eye_right_crop = frame[right_coords[1]-50:right_coords[1]+35, right_coords[0]-50:right_coords[0]+50]
    # gray 
    gray_left, gray_right = cv2.cvtColor(eye_left_crop, cv2.COLOR_BGR2GRAY), cv2.cvtColor(eye_right_crop, cv2.COLOR_BGR2GRAY)
    # resize
    resized_left = cv2.resize(gray_left, (100, 100))
    resized_right = cv2.resize(gray_right, (100, 100))
    # reshape
    reshaped_left = resized_left.reshape((100,100,1))
    reshaped_right = resized_right.reshape((100,100,1))
    
    return reshaped_left, reshaped_right

