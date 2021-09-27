import mediapipe as mp 
import numpy as np

class FaceDetector:

    KEYPOINTS = {'left':[159,145,33,133], 
                  'right':[386,374,362,263]}

    def __init__(self, static:bool=True, min_detection_confidence:float=0.4, min_tracking_confidence:float=0.5):

        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=static, 
                                        max_num_faces=1,
                                        min_detection_confidence=min_detection_confidence, 
                                        min_tracking_confidence=min_tracking_confidence)
        self.input_shape = None
        self.landmarks = None
        self.left_keys = [159,145,33,133]
        self.right_keys = [386,374,362,263]

    @staticmethod
    def _get_xy(point, input_shape):
        return int(point.x * input_shape[1]), int(point.y * input_shape[0])
      
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
            
            landmarks = results.multi_face_landmarks[0]
            
            return landmarks
    
    def _get_coordinates(self, landmarks):
        """_get_coordinates processes the landmarks list and extracts
        the useful coordinates for eyes

        Args:
            landmark list: normalized landmark list
          """
        left_normalized_points = [landmarks.landmark[i] for i in self.KEYPOINTS['left']]
        right_normalized_points = [landmarks.landmark[i] for i in self.KEYPOINTS['right']]

        left_coords = [self._get_xy(point, self.input_shape) for point in left_normalized_points]
        right_coords = [self._get_xy(point, self.input_shape) for point in right_normalized_points]

        return (left_coords, right_coords)
    
    def _crop_images(self, frame:np.array, coords:tuple):
        """_crop_images uses the useful coordinates from the _get_coordinates
        method to crop the frame into left and right eye images

        Args:
            frame (array): image frame 

        Returns:
            tuple: tuple of images (left_eye, right_eye)
        """
        left_coords, right_coords = coords
        k=15 
        j=10
        #### left eye
        y1, y2, x1, x2 = left_coords
        eye_left = frame[y1[1]-k:y2[1]+k, x1[0]-j:x2[0]+j]
        
        #### right eye
        y1, y2, x1, x2 = right_coords
        eye_right = frame[y1[1]-k:y2[1]+k, x1[0]-j:x2[0]+j]

        return (eye_left, eye_right)

    def eyes(self, frame:np.array):
        """eyes uses the coordinates found by mediapipe's facemesh to crop 
        the left and right eye.

        Args:
            frame (np.array): frame captured by camera

        Returns:
            tuple: (left,right) eye images
        """
        landmarks = self._detect(frame)  
        if landmarks:
            coords = self._get_coordinates(landmarks)
            eyes = self._crop_images(frame, coords)
            return eyes