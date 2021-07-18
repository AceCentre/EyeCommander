import mediapipe as mp 
import numpy as np
import cv2 

class FaceDetector:
    KEYPOINTS = {'left':[159,145,33,133], 'right':[386,374,362,263], 
                 'left_outline':[33,7,163,144,145,153,154,155,133, 173,157,158,159,160,161,246], 
                 'right_outline':[362,382,381,380,374,373,390,249,263,466,388,387,386,385,384,398]}
   
    def __init__(self, static:bool=False):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=static, 
                                                         max_num_faces=1,
                                                         min_detection_confidence=0.9, min_tracking_confidence=0.9)
        self.input_shape = None
        
        self.landmarks = None
        self.left_keys = None
        self.right_keys = None
        self.left_outline = None
        self.right_outline = None
        
    def _detect(self, frame: np.array):
        self.input_shape = frame.shape
        results = self.face_mesh.process(frame)
        if results.multi_face_landmarks:
            detection = results.multi_face_landmarks[0].landmark
            return detection
    
    def _get_coordinates(self, detection):
        
        self.landmarks = []
        for point in detection:
            self.landmarks.append([int(point.x * self.input_shape[1]), int(point.y * self.input_shape[0])])

        self.left_keys = []
        for point in self.KEYPOINTS['left']:
            self.left_keys.append(self.landmarks[point])
        
        self.right_keys = []   
        for point in self.KEYPOINTS['right']:
            self.right_keys.append(self.landmarks[point])
        
        self.left_outline = []
        for point in self.KEYPOINTS['left_outline']:
            self.left_outline.append(self.landmarks[point])
        
        self.right_outline = []
        for point in self.KEYPOINTS['right_outline']:
            self.right_outline.append(self.landmarks[point])
          
        self.left_outline = np.array([self.left_outline], dtype=np.int32)
        self.right_outline = np.array([self.right_outline], dtype=np.int32) 
    
    def _crop_images(self, frame, k:int=15):
        #### left eye
        y1, y2, x1, x2 = self.left_keys
        eye_left = frame[y1[1]-k:y2[1]+10, x1[0]-k:x2[0]+k]
        
        #### right eye
        y1, y2, x1, x2 = self.right_keys
        eye_right = frame[y1[1]-k:y2[1]+10, x1[0]-k:x2[0]+k]

        return (eye_left, eye_right)

    def eyes(self, frame:np.array):
        detection = self._detect(frame)  
        if detection:
            self._get_coordinates(detection)
            eyes = self._crop_images(frame)
            return eyes          

    