from typing import Tuple
import cv2
import mediapipe as mp
import glob
import os
import tensorflow as tf
from collections import Counter
import numpy as np

class EyeCommander:
    FD = mp.solutions.face_detection
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    DECISION_THRESHOLD = 0.9

    def __init__(self, model, window_size: int =12):
        self.cam = cv2.VideoCapture(0)
        self.model = model
        self.face_detection = self.FD.FaceDetection(min_detection_confidence=0.8)
        self.frame = None
        self.display_frame = None
        self.prediction_window = PredictionWindow(size=window_size)
        self.window_size = window_size

        self.window_prediction = None
        self.confidence = None
        self.shape = None
        self.eye_status = False
        self.cam_status = False
        
    def _bounding_box(self, detection):
        shape = self.shape
        location_data = detection.location_data
        bb_object = location_data.relative_bounding_box
        xmin = int(bb_object.xmin * shape[1])
        ymin = int(bb_object.ymin * shape[0])
        width = int(bb_object.width * shape[1])
        height = int(bb_object.height * shape[0])
        return (xmin, ymin, width, height)

    def _eye_cords(self, detection):
        shape = self.shape
        location_data = detection.location_data
        keypoints = location_data.relative_keypoints[:2]
        left = (int(keypoints[0].x * shape[1]), int(keypoints[0].y * shape[0]))
        right = (int(keypoints[1].x * shape[1]), int(keypoints[1].y * shape[0]))
        return (left, right)   

    def _extract_eyes(self, static: bool = False):
        if static == True:
            processed_frame = self.frame
        else:
            processed_frame = cv2.cvtColor(cv2.flip(self.frame, 1), cv2.COLOR_BGR2RGB)
        # detect face and landmarks using tensorflow mediapipe
        results = self.face_detection.process(processed_frame)
        if results.detections:
            detection = results.detections[0]
            self.shape = self.frame.shape
            left, right = self._eye_cords(detection)
            cropped_left = processed_frame[left[1]-50:left[1]+35, left[0]-50:left[0]+50]
            cropped_right = processed_frame[right[1]-50:right[1]+35, right[0]-50:right[0]+50]
            self.eye_right = cropped_right
            self.eye_left = cropped_left
            self._process_eyes()
            self.eye_status = True
        else:
            self.eye_status = False
    
    def _process_eyes(self):
        # gray 
        left, right = cv2.cvtColor(self.eye_left, cv2.COLOR_BGR2GRAY), cv2.cvtColor(self.eye_right, cv2.COLOR_BGR2GRAY)
        # resize
        resized_left = cv2.resize(left, (100, 100))
        resized_right = cv2.resize(right, (100, 100))
        # reshape
        reshaped_left = resized_left.reshape((100,100,1))
        reshaped_right = resized_right.reshape((100,100,1))
        # re_assignment
        self.eye_left = reshaped_left
        self.eye_right = reshaped_right

    def _predict_frame(self, eye_img):
        img = eye_img.copy()
        batch = np.expand_dims(img,0)
        prediction = self.model.predict_classes(batch)[0]
        return prediction
    
    def _predict_window(self):
        counter = self.prediction_window.most_common()
        frequency = counter[1]/self.window_size
        prediction = counter[0]
        return prediction, frequency
    
    def _classify(self):
        if (self.cam_status == True) and (self.eye_status == True):
            # make prediction on left eye
            prediction_left = self._predict_frame(self.eye_left)
            # make prediction on right eye
            prediction_right = self._predict_frame(self.eye_right)
            # add both predictions to the prediction window
            self.prediction_window.insert_prediction(prediction_left)
            self.prediction_window.insert_prediction(prediction_right)
        # make prediction over a window by majority vote
        self.window_prediction, self.confidence = self._predict_window()
             

    def _display_prediction(self, label, color = (252, 198, 3), font=cv2.FONT_HERSHEY_PLAIN):
        if label == 'left':
            cv2.putText(self.display_frame, "left", (50, 375), font , 7, color, 15)
        elif label == 'right':
            cv2.putText(self.display_frame, "right", (900, 375), font, 7, color, 15)
        elif label == 'up':
            cv2.putText(self.display_frame, "up", (575, 100), font, 7, color, 15)
        else:
            cv2.putText(self.display_frame, "down", (500, 700), font, 7, color, 15)
        # display frame
        cv2.imshow("frame", self.display_frame)

    def _refresh(self):
        self.cam_status, self.frame = self.cam.read()
        # set the flag to improve performance
        self.frame.flags.writeable = False
        # Stop if no video input
        if self.cam_status == True:
            self.shape = self.frame.shape
            # create display frame 
            self.display_frame = cv2.flip(self.frame, 1)
            self.display_frame.flags.writeable = True
            # extract eye images
            self._extract_eyes()

    def demo(self):
        while self.cam.isOpened():
            # capture a frame and extract eye images
            self._refresh()
            if (self.cam_status == False) or (self.eye_status == False):
                continue
            # display suggested head placement box
            cv2.rectangle(self.display_frame,(420,20),(900,700),(100,175,255),3)
            cv2.putText(self.display_frame, "center head inside box", (470, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (100,175,255), 1)
            # make classifcation based on eye images
            self._classify() 
            # display results
            if self.confidence > self.DECISION_THRESHOLD:
                label = self.CLASS_LABELS[self.window_prediction]
                self._display_prediction(label)
            else:
                cv2.imshow('frame', self.display_frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                break
        self.cam.release()
        cv2.destroyAllWindows()

class PredictionWindow(object):
    def __init__(self, size=5):
        self.size = size
        self.items = []
    
    def insert_prediction(self, prediction):
        if len(self.items) == self.size:
            self.items.insert(0,prediction)
            self.items.pop()
        else:
            self.items.append(prediction)
    
    def most_common(self):
        return Counter(self.items).most_common(1)[0]


if __name__ == "__main__":
    model = tf.keras.models.load_model('./Models/jupiter1')
    commander = EyeCommander(model=model)
    commander.demo()


