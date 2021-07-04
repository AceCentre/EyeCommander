import cv2
import mediapipe as mp
import numpy as np
from preprocessing import preprocessing

class EyeDetector:
    
    def __init__(self, confidence =0.8):
        self.detector = mp.solutions.face_detection.FaceDetection(min_detection_confidence=confidence)
        self.shape = None
        self.eye_left = None
        self.eye_right = None
        self.status = False
        
    def bounding_box(self, detection):
        shape = self.shape
        location_data = detection.location_data
        bb_object = location_data.relative_bounding_box
        xmin = int(bb_object.xmin * shape[1])
        ymin = int(bb_object.ymin * shape[0])
        width = int(bb_object.width * shape[1])
        height = int(bb_object.height * shape[0])
        return (xmin, ymin, width, height)
    
    def eye_coords(self, detection):
        location_data = detection.location_data
        keypoints = location_data.relative_keypoints[:2]
        left = (int(keypoints[0].x * self.shape[1]), int(keypoints[0].y * self.shape[0]))
        right = (int(keypoints[1].x * self.shape[1]), int(keypoints[1].y * self.shape[0]))
        return (left, right) 
    
    def extract_eyes(self, frame, static: bool = False):
        if static == False:
            frame = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)
        # detect face and landmarks using tensorflow mediapipe
        results = self.detector.process(frame)
        
        if results.detections:
            detection = results.detections[0]
            self.shape = frame.shape
            left_coords, right_coords = self.eye_coords(detection)
            eye_left, eye_right = preprocessing.process_eye_images(frame=frame, left_coords=left_coords, 
                                                     right_coords=right_coords)
            self.status = True
            return eye_left, eye_right
        else:
            self.status = False
            return None, None