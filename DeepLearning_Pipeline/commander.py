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
from calibration import calibration
from classification import classification

class EyeCommander:
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    TEMP_DATAPATH = './temp'
    BASE_MODEL_PATH = './models/jupiter2'
    
    def __init__(self, model=None, window_size: int =12, image_shape:tuple =(100,100,1)):
        self.camera = cv2.VideoCapture(0)
        self.calibration = calibration.Calibration()
        self.eye_detection = eye_detection.EyeDetector()
        self.prediction_window = classification.PredictionWindow(size=window_size)
        self.window_size = window_size
        self.model = model
        self.calibration_done = False
        self.image_shape = image_shape
         
    def refresh(self):
        cam_status, frame = self.camera.read()
        # set the flag to improve performance
        frame.flags.writeable = False
        # Stop if no video input
        if cam_status == True:
            # create display frame 
            display_frame = cv2.flip(frame, 1)
            display_frame.flags.writeable = True
            return (display_frame, frame)
        else:
            return None

    def _eye_images_from_frame(self, frame):
        eyes = self.eye_detection.extract_eyes(frame)
        if eyes:
            return eyes
        else:
            return None
    
    def _preprocess_eye_images(self, eye_left:np.array, eye_right:np.array):
        shape = self.image_shape
        # gray 
        gray_left = cv2.cvtColor(eye_left, cv2.COLOR_BGR2GRAY)
        gray_right =  cv2.cvtColor(eye_right, cv2.COLOR_BGR2GRAY)
        # resize
        resized_left = cv2.resize(gray_left, shape[:2])
        resized_right = cv2.resize(gray_right, shape[:2])
        # reshape
        reshaped_left = resized_left.reshape(shape)
        reshaped_right = resized_right.reshape(shape)
        
        return reshaped_left, reshaped_right

    def _prep_batch(self, images: tuple):
        img1 = images[0].reshape(self.image_shape)
        img2 = images[1].reshape(self.image_shape)
        img1 = np.expand_dims(img1,0)
        img2 = np.expand_dims(img2,0)
        batch = np.concatenate([img1,img2])
        return batch
    
    def _predict_batch(self, batch:np.array):
        if self.calibration_done == True:
            predictions = self.model.predict(batch) 
        else:
             predictions = self.model.predict(batch)
        return predictions   
            
    def predict(self, eye_left:np.array, eye_right:np.array):
        # make batch
        batch = self._prep_batch((eye_left, eye_right))
        # make prediction on batch
        predictions = self._predict_batch(batch)
        # add both predictions to the prediction window
        self.prediction_window.insert_predictions(predictions)
        # make prediction over a window 
        pred, mean_proba = self.prediction_window.predict()
        return pred, mean_proba
             
    def _display_prediction(self, label, frame, color = (252, 198, 3), font=cv2.FONT_HERSHEY_PLAIN):
        if label == 'left':
            cv2.putText(frame, "left", (50, 375), font , 7, color, 15)
        elif label == 'right':
            cv2.putText(frame, "right", (900, 375), font, 7, color, 15)
        elif label == 'up':
            cv2.putText(frame, "up", (575, 100), font, 7, color, 15)
        else:
            cv2.putText(frame, "down", (500, 700), font, 7, color, 15)
    
    def run(self, calibrate=True):
        if calibrate == True:
            self.model = self.calibration.calibrate() 
            self.calibration_done == True 
        else:
            self.model = tf.keras.models.load_model(self.BASE_MODEL_PATH)
        while self.camera.isOpened():
            # capture a frame and extract eye images
            camera_output = self.refresh()
            # if the camera is outputing images
            if camera_output:
                display_frame, frame = camera_output
                # detect eyes
                eyes = self._eye_images_from_frame(frame)
                # if detection is able to isolate eyes
                if eyes:
                    eye_left, eye_right = eyes
                    eye_left_processed, eye_right_processed = self._preprocess_eye_images(eye_left, eye_right)
                    # make classifcation based on eye images
                    prediction, mean_proba = self.predict(eye_left_processed, eye_right_processed) 
                    # display results
                    if (self.prediction_window.is_full() == True) and (mean_proba > 4):
                        label = self.CLASS_LABELS[prediction]
                        self._display_prediction(label=label, frame=display_frame)
                        
                cv2.imshow('eye', eye_left_processed)
                    # self._display_prediction(label, display_frame)
                # display suggested head placement box
                cv2.rectangle(display_frame,(420,20),(900,700),(100,175,255),3)
                cv2.putText(display_frame, "center head inside box", 
                        (470, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (100,175,255), 1)
                cv2.imshow('display', display_frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                shutil.rmtree('./temp/data')
                break
                
        self.camera.release()
        cv2.destroyAllWindows()
    
if __name__ == "__main__":
    # model = tf.keras.models.load_model('./models/jupiter2')
    commander = EyeCommander()
    commander.run(calibrate=False)   
    # c = calibration.Calibration()
    # c.gen_data(direction='up',n_frames=50)
    # pass
    
    


