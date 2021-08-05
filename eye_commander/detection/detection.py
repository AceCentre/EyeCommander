import cv2
import mediapipe as mp
import numpy as np

class EyeDetector:
    
    def __init__(self, confidence:float =0.8):
        self.detector = mp.solutions.face_detection.FaceDetection(min_detection_confidence=confidence)
        self.shape = None
        self.eye_left = None
        self.eye_right = None
        self.status = False
        
    def bounding_box(self, detection):
        """bounding box uses a tensorflow mediapipe to predict the 
        bounding box for a face. 

        Args:
            detection (detection object): mediapipe detection object

        Returns:
            tuple(iterable): coordinates for bounding box
        """
        shape = self.shape
        location_data = detection.location_data
        bb_object = location_data.relative_bounding_box
        xmin = int(bb_object.xmin * shape[1])
        ymin = int(bb_object.ymin * shape[0])
        width = int(bb_object.width * shape[1])
        height = int(bb_object.height * shape[0])
        return (xmin, ymin, width, height)
    
    def eye_coords(self, detection):
        """eye_coords predicts the x,y coordinates for eye centers

        Args:
            detection (detection object): mediapipe detection object

        Returns:
            tuple(iterable): nested tuple containing left and right eye coordinates
        """
        location_data = detection.location_data
        keypoints = location_data.relative_keypoints[:2]
        left = (int(keypoints[0].x * self.shape[1]), int(keypoints[0].y * self.shape[0]))
        right = (int(keypoints[1].x * self.shape[1]), int(keypoints[1].y * self.shape[0]))
        return (left, right) 
    
    def extract_eyes(self, frame:np.array, static: bool = False):
        """extract_eyes uses eye coordinates from eye_coords method to generate cropped eye images.

        Args:
            frame (np.frame): raw image data
            static (bool, optional): option for if using to detect on jpg images. Defaults to False.

        Returns:
            tuple(iterable): tuple of cropped images, left and right.
        """
        if static == False:
            frame = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)
        # detect face and landmarks using tensorflow mediapipe
        results = self.detector.process(frame)
        
        if results.detections:
            detection = results.detections[0]
            self.shape = frame.shape
            left_coords, right_coords = self.eye_coords(detection)
            eye_left_crop = frame[left_coords[1]-50:left_coords[1]+35, left_coords[0]-50:left_coords[0]+50]
            eye_right_crop = frame[right_coords[1]-50:right_coords[1]+35, right_coords[0]-50:right_coords[0]+50]
            self.status = True
            return (eye_left_crop, eye_right_crop)
        else:
            self.status = False
            return None