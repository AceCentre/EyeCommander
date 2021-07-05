import cv2
import pyglet
import shutil 
import glob
import os
from typing import Tuple
import mediapipe as mp
import tensorflow as tf
from collections import Counter
import numpy as np
from detection import eye_detection 
from configuration import configuration
from classification import classification

class EyeCommander:
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    SOUND  = pyglet.media.load("./sounds/ding.mp3", streaming=False)
    TEMP_DATAPATH = './temp'
    DEFAULT_MODEL = tf.keras.models.load_model('./models/jupiter2')
    
    def __init__(self, model=None, window_size: int =12):
        self.cam = cv2.VideoCapture(0)
        self.configuration = configuration.Configuration()
        self.eye_detection = eye_detection.EyeDetector()
        self.prediction_window = classification.PredictionWindow(size=window_size)
        self.window_size = window_size

        self.model = model
        self.frame = None
        self.display_frame = None
        self.shape = None
        self.eye_status = False
        self.cam_status = False 
        self.callibration_done = False

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
            self.eye_left, self.eye_right = self.eye_detection.extract_eyes(self.frame)
            self.eye_status = self.eye_detection.status

    def _prep_batch(self, images: tuple):
        img1 = images[0].reshape((100,100,1))
        img2 = images[1].reshape((100,100,1))
        img1 = np.expand_dims(img1,0)
        img2 = np.expand_dims(img2,0)
        batch = np.concatenate([img1,img2])
        return batch
    
    def _predict_batch(self, batch):
        if self.callibration_done == True:
            predictions = self.model.predict(batch) 
        else:
             predictions = self.DEFAULT_MODEL.predict(batch)
        return list(predictions)   
    
    def _classify(self):
        if (self.cam_status == True) and (self.eye_status == True):
            # make batch
            batch = self._prep_batch((self.eye_left, self.eye_right))
            # make prediction on batch
            predictions = self._predict_batch(batch)
            # add both predictions to the prediction window
            self.prediction_window.insert_predictions(predictions)
    
        # make prediction over a window 
        pred, mean_proba = self.prediction_window.predict()
        return pred, mean_proba
             
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
       
    def run(self, configure=True):
        if configure == True:
            self.model = self.configuration.configure() 
            self.callibration_done == True 
        while self.cam.isOpened():
            # capture a frame and extract eye images
            self._refresh()
            if (self.cam_status == False) or (self.eye_status == False):
                continue
            # display suggested head placement box
            cv2.rectangle(self.display_frame,(420,20),(900,700),(100,175,255),3)
            cv2.putText(self.display_frame, "center head inside box", 
                        (470, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (100,175,255), 1)
            # make classifcation based on eye images
            prediction, mean_proba = self._classify() 
            # display results
            if (self.prediction_window.is_full() == True) and (mean_proba > 8):
                label = self.CLASS_LABELS[prediction]
                self._display_prediction(label)
            else:
                cv2.imshow('frame', self.display_frame)
            cv2.imshow('eye',self.eye_right)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                shutil.rmtree('./temp/data')
                break
                
        self.cam.release()
        cv2.destroyAllWindows()
    
if __name__ == "__main__":
    # model = tf.keras.models.load_model('./models/jupiter2')
    commander = EyeCommander()
    commander.run(configure=False)
    
    


