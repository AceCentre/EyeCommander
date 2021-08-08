import mediapipe as mp 
import numpy as np
import cv2 

class FaceDetector:
    
    KEYPOINTS = {'left':[159,145,33,133], 
                 'right':[386,374,362,263], 
                 'left_outline':[33,7,163,144,145,153,154,155,
                                 133, 173,157,158,159,160,161,246], 
                 'right_outline':[362,382,381,380,374,373,390,249,
                                  263,466,388,387,386,385,384,398]}
    
    def __init__(self, static:bool=False, 
                 min_detection_confidence:float=0.7, 
                 min_tracking_confidence:float=0.7):
        
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=static, 
                                                         max_num_faces=1,
                                                         min_detection_confidence=min_detection_confidence, 
                                                         min_tracking_confidence=min_tracking_confidence)
        self.input_shape = None
        self.landmarks = None
        self.left_keys = None
        self.right_keys = None
        self.left_outline = None
        self.right_outline = None
        self.mask = None
        
    def _detect(self, frame: np.array):
        """Wrapper for mediapipe's process method. Detects face mesh landmarks.

        Args:
            frame (np.array): frame from camera

        Returns:
            detection object: mediapipe detection object
        """
        self.input_shape = frame.shape
        
        results = self.face_mesh.process(frame)
        
        if results.multi_face_landmarks:
            
            detection = results.multi_face_landmarks[0].landmark
            
            return detection
    
    def _get_coordinates(self, detection):
        """_get_coordinates processes the detection object and extracts
        the useful coordinates for eyes

        Args:
            detection object: mediapipe detection object
        """
        
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
    
    def _crop_images(self, frame:np.array):
        """_crop_images uses the useful coordinates from the _get_coordinates
        method to crop the frame into left and right eye images

        Args:
            frame (array): image frame 

        Returns:
            tuple: tuple of images (left_eye, right_eye)
        """
        k=15 
        j=10
        #### left eye
        y1, y2, x1, x2 = self.left_keys
        eye_left = frame[y1[1]-k:y2[1]+k, x1[0]-j:x2[0]+j]
        
        #### right eye
        y1, y2, x1, x2 = self.right_keys
        eye_right = frame[y1[1]-k:y2[1]+k, x1[0]-j:x2[0]+j]

        return (eye_left, eye_right)
    
    def generate_mask(self, frame:np.array):
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        mask = cv2.fillConvexPoly(mask, self.left_outline,255)
        mask = cv2.fillConvexPoly(mask, self.right_outline,255)
        kernel = np.ones((9, 9), np.uint8)
        mask = cv2.dilate(mask, kernel, 5)
        mask = self._crop_images(mask)
        return mask
    
    def _mask(self,frame):
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        mask = cv2.fillConvexPoly(mask, self.left_outline,255)
        mask = cv2.fillConvexPoly(mask, self.right_outline,255)
        kernel = np.ones((9, 9), np.uint8)
        mask = cv2.dilate(mask, kernel, 5)
        return mask
    
    def eyes(self, frame:np.array):
        """eyes uses the coordinates found by mediapipe's facemesh to crop 
        the left and right eye.

        Args:
            frame (np.array): frame captured by camera

        Returns:
            tuple: (left,right) eye images
        """
        detection = self._detect(frame)  
        if detection:
            self._get_coordinates(detection)
            eyes = self._crop_images(frame)
            return eyes
      