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
    def __init__(self, static: bool=True):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=static, 
                                                         max_num_faces=1,
                                                         min_detection_confidence=0.9)
        self.landmarks = None
        self.left_keypoints = [159,145,33,133]
        self.right_keypoints = [386,374,362,263]
        self.left_outline_keypoints = [33,7,163,144,145,153,154,155,133, 173,157,158,159, 160,161, 246]
        self.right_outline_keypoints = [362, 382,381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.left_coords = None
        self.right_coords = None
        self.masked_frame = None
        self.eye_left = None
        self.eye_right = None
        self.shape = (50,90)
    
    def get_landmarks(self, frame):
        shape = frame.shape
        results = self.face_mesh.process(frame)
        self.landmarks = []
        if results.multi_face_landmarks:
            relative_landmarks = results.multi_face_landmarks[0].landmark
            for point in relative_landmarks:
                self.landmarks.append((int(point.x * shape[1]), int(point.y * shape[0]), point.z))
            return True
        else:
            return False
            
    def get_outline_coords(self):
        left = []
        right = []
        for point in self.left_outline_keypoints:
          
            coords = list(self.landmarks[point])
            coords = coords[:2]
            left.append(coords)
        
        
        for point in self.right_outline_keypoints:
    
            coords = list(self.landmarks[point])
            coords = coords[:2]
            right.append(coords)
        
    
        self.left_coords = np.array([left], dtype=np.int32)
        self.right_coords = np.array([right], dtype=np.int32)
    
    
    def generate_mask(self,frame):
        mask = np.zeros((frame.shape[0], frame.shape[1], 3), np.uint8)
        cv2.fillPoly(img=mask , pts=self.left_coords, color=(255,255,255) )
        cv2.fillPoly(img=mask , pts=self.right_coords, color=(255,255,255) )
        masked_frame = cv2.bitwise_and(frame, mask)
        return masked_frame
    
    def cropped_eye_frames(self, frame, k:int=15):
        #### left eye
        up = self.landmarks[self.left_keypoints[0]]
        down = self.landmarks[self.left_keypoints[1]]
        left = self.landmarks[self.left_keypoints[2]]
        right = self.landmarks[self.left_keypoints[3]]
        eye_left = frame[up[1]-15:down[1]+10, left[0]-k:right[0]+k]

        #### right eye
        up = self.landmarks[self.right_keypoints[0]]
        down = self.landmarks[self.right_keypoints[1]]
        left = self.landmarks[self.right_keypoints[2]]
        right = self.landmarks[self.right_keypoints[3]]
        eye_right = frame[up[1]-15:down[1]+10, left[0]-k:right[0]+k]
        return (eye_left, eye_right)
    
    def preprocess(self, img):
        shape = img.shape
        img = cv2.medianBlur(img,5)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        flat = img.flatten()
        flat[flat<=60] = 0
        flat[flat>60] = 255
        reshaped = np.reshape(flat, shape[:2])
        processed = cv2.resize(reshaped, (90,50))
        return processed
        
    def detect(self,frame):
        success = self.get_landmarks(frame)
        if success == True:
            self.get_outline_coords()
            self.masked_frame = self.generate_mask(frame)
            return True
        else:
            return False
    
    def generate_masked_eye_frames(self):
        eyes = self.cropped_eye_frames(self.masked_frame)
        if eyes:
            eyes = [self.preprocess(img) for img in eyes]
            return eyes
        
    def generate_eye_frames(self, frame):
        eyes = self.cropped_eye_frames(frame)
        if eyes:
            return eyes
    
    def extract_eyes(self, frame:np.array, static: bool = False, masked:bool=True, k:int=15):
        exito = self.detect(frame)
        if exito == True:
            if masked == True:
                eyes = self.generate_masked_eye_frames()
            else:
                eyes = self.generate_eye_frames(frame)
            return eyes

class Meshy:
    def __init__(self):
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, 
                                                         max_num_faces=1,
                                                         min_detection_confidence=0.9, min_tracking_confidence=0.9)
        self.landmarks = None
        self.left_keypoints = [159,145,33,133]
        self.right_keypoints = [386,374,362,263]
        self.left_outline_keypoints = [33,7,163,144,145,153,154,155,133, 173,157,158,159, 160,161, 246]
        self.right_outline_keypoints = [362, 382,381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.left_coords = None
        self.right_coords = None
        self.masked_frame = None
        self.eye_left = None
        self.eye_right = None
        self.shape = (50,90)
        
    def preprocess_image(self, frame):
        img = frame
        t = 80
        img = cv2.GaussianBlur(img, (7,7), 0)
        shape = img[:,:,0].shape
        for i in range(3):
            channel = img[:,:,i]
            flat = channel.flatten()
            flat[flat<=t] = 0
            flat[flat>t] = 255
            reshaped = np.reshape(flat, shape)
            img[:,:,i] = reshaped

        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.GaussianBlur(img, (7,7), 0)
        flat = img.flatten()
        flat[flat<=50] = 0
        flat[flat>50] = 255
        reshaped = np.reshape(flat, img.shape)
        img = reshaped

        # img = cv2.GaussianBlur(img, (13, 13), 0)
        return img

    def get_landmarks(self, frame):
        shape = frame.shape
        results = self.face_mesh.process(frame)
        self.landmarks = []
        if results.multi_face_landmarks:
            relative_landmarks = results.multi_face_landmarks[0].landmark
            for point in relative_landmarks:
                self.landmarks.append((int(point.x * shape[1]), int(point.y * shape[0]), point.z))
            return True
        else:
            return False
      
    def get_outline_coords(self):
        left = []
        right = []
        for point in self.left_outline_keypoints:
            coords = list(self.landmarks[point])
            coords = coords[:2]
            left.append(coords)
            
        for point in self.right_outline_keypoints:
            coords = list(self.landmarks[point])
            coords = coords[:2]
            right.append(coords)
        
        self.left_coords = np.array([left], dtype=np.int32)
        self.right_coords = np.array([right], dtype=np.int32)
    
    def generate_mask(self,frame):
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        mask = cv2.fillConvexPoly(mask, self.left_coords,255)
        mask = cv2.fillConvexPoly(mask, self.right_coords,255)
        kernel = np.ones((9, 9), np.uint8)
        mask = cv2.dilate(mask, kernel, 5)
        masked_frame = cv2.bitwise_and(frame, frame, mask=mask)
        return masked_frame
    
    def cropped_eye_frames(self, frame, k:int=15):
        #### left eye
        up = self.landmarks[self.left_keypoints[0]]
        down = self.landmarks[self.left_keypoints[1]]
        left = self.landmarks[self.left_keypoints[2]]
        right = self.landmarks[self.left_keypoints[3]]
        eye_left = frame[up[1]-15:down[1]+10, left[0]-k:right[0]+k]

        #### right eye
        up = self.landmarks[self.right_keypoints[0]]
        down = self.landmarks[self.right_keypoints[1]]
        left = self.landmarks[self.right_keypoints[2]]
        right = self.landmarks[self.right_keypoints[3]]
        eye_right = frame[up[1]-15:down[1]+10, left[0]-k:right[0]+k]
        return (eye_left, eye_right)
    
    def preprocess(self, img):
        shape = img.shape[:2]
        img = cv2.GaussianBlur(img, (7,7), 0)
        for i in range(3):
            channel = img[:,:,i]
            flat = channel.flatten()
            flat[flat<=90] = 0
            flat[flat>90] = 255
            reshaped = np.reshape(flat, shape)
            img[:,:,i] = reshaped

        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.GaussianBlur(img, (7,7), 0)
        flat = img.flatten()
        flat[flat<=50] = 0
        flat[flat>50] = 255
        reshaped = np.reshape(flat, shape)
        img = reshaped
        return img
        

    def detect(self,frame):
        success = self.get_landmarks(frame)
        if success == True:
            self.get_outline_coords()
            return True
        else:
            return False
        
 
    def extract_eyes(self, frame:np.array, static: bool = False, masked:bool=True, k:int=15):
        exito = self.detect(frame)
        if exito == True:
            processed = self.preprocess_image(frame)
            masked = self.generate_mask(processed)
            eyes = self.cropped_eye_frames(masked)
            if eyes:
                left = cv2.resize(eyes[0], (90,50))
                right = cv2.resize(eyes[1], (90,50))
                return (left,right)
        
    # def extract_eyes(self, frame:np.array, static: bool = False):
    #     self.detect(frame)
    #     processed = self.preprocess_image(frame)
    #     masked = self.generate_mask(processed)
    #     eyes = self.cropped_eye_frames(masked)
    #     if eyes:
    #         left = cv2.resize(eyes[0], (25,40))
    #         right = cv2.resize(eyes[1], (25,40))
    #         return (left,right)

