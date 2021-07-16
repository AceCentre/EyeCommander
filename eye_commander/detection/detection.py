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
    
class FaceMesh:
    def __init__(self):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=False, 
                                                         max_num_faces=1,
                                                         min_detection_confidence=0.7)
        self.landmarks = None
        self.left_key = [159,145,33,133]
        self.right_key = [386,374,362,263]
    
    def get_landmarks(self, frame):
        shape = frame.shape
        results = self.face_mesh.process(frame)
        self.landmarks = []
        if not results.multi_face_landmarks:
            pass
        else:
            raw_landmarks = results.multi_face_landmarks[0].landmark
            for point in raw_landmarks:
                self.landmarks.append((int(point.x * shape[1]), int(point.y * shape[0]), point.z))
    
    def extract_eyes(self, frame:np.array, static: bool = False, k:int=15):
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
        shape = frame.shape
        results = self.face_mesh.process(frame)
        if results.multi_face_landmarks:
            detection = results.multi_face_landmarks[0].landmark
            landmarks = []
            for point in detection:
                landmarks.append((int(point.x * shape[1]), int(point.y * shape[0]), point.z))
            
            #### left eye
            up = landmarks[self.left_key[0]]
            down = landmarks[self.left_key[1]]
            left = landmarks[self.left_key[2]]
            right = landmarks[self.left_key[3]]
            eye_left = frame[up[1]-k:down[1]+k, left[0]-k:right[0]+k]
            
            #### right eye
            up = landmarks[self.right_key[0]]
            down = landmarks[self.right_key[1]]
            left = landmarks[self.right_key[2]]
            right = landmarks[self.right_key[3]]
            eye_right = frame[up[1]-k:down[1]+k, left[0]-k:right[0]+k]
            return (eye_left, eye_right)
    
        else:
            return None
        
    def draw_point(self, idx, frame):
        cv2.circle(frame, self.landmarks[idx],2,color=(255,0,0))
    
    def draw_eyes(self, frame):
        left_inner = [33,7,163,144,145,153,154,155,133, 173,157,158,159, 160,161, 246]

        right_inner = [362, 382,381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

        for point in left_inner:
            cv2.circle(frame, self.landmarks[point],2,color=(255,0,0))
            
        for point in right_inner:
            cv2.circle(frame, self.landmarks[point],2,color=(255,0,0))
            
        

