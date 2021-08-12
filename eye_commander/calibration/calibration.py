from eye_commander.image_capture import image_capture
from eye_commander.face_detection import face_detection
from eye_commander.models import models
import os
import shutil
import cv2
import glob
import numpy as np
import tensorflow as tf


class Calibrator:
    
    TEMP_PATH = os.path.join(os.getcwd(),'eye_commander/temp')
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    
    def __init__(self, keep_data:bool=True):
        
        self.camera = image_capture.Camera()
        self.face_detector = face_detection.FaceDetector()    
        self.keep_data = keep_data
        
    def _build_temp_data_directory(self):
        """_build_directory generates the nested directory structure that will be used
        to store user data for tuning.
        """
        
        path = os.path.join(self.TEMP_PATH,'data')
        
        # delete any leftover temp data from the last session
        if os.path.exists(path) == True:
            
            shutil.rmtree(path)
            
        os.mkdir(path)
        
        for label in self.CLASS_LABELS:
            
            newpath = os.path.join(path,label)
            
            os.mkdir(newpath)
    
    def _remove_temp_data(self):
        
        shutil.rmtree(self.TEMP_PATH)
          
    def _load_data(self):
        
        path = os.path.join(self.TEMP_PATH, 'data')
        
        d = {}
        
        for idx, label in enumerate(['center', 'down', 'left', 'right', 'up']):
            
            subpath = os.path.join(path, label)
            
            files = glob.glob(subpath + '/*.jpg')
            
            data = []
            
            for f in files:
                
                img = cv2.imread(f, cv2.IMREAD_UNCHANGED)
                
                data.append(img)
                
            d[idx] = data
            
        images = []
        
        labels = []
        
        for key, val in d.items():
            
            images.extend(val)
            
            labels.extend([key]*len(val))
        
        print(f'dataset size: {len(images)}')
        
        return images, labels
    
    def _process_caputred_frames(self, data:dict):
        
        basepath = os.path.join(self.TEMP_PATH,'data')
        
        for key, frames in data.items():   
            
            class_path = os.path.join(basepath, key)
            
            count = 1   
            
            for frame in frames:
                
                eyes = self.face_detector.eyes(frame=frame)
                
                if eyes:
                    
                    left, right = eyes
                    
                    cv2.imwrite(os.path.join(class_path,f'{key}{count}.jpg'), left)
                    
                    cv2.imwrite(os.path.join(class_path,f'{key}{count+1}.jpg'), right)
                    
                    count += 2
    
    def calibrate(self):
        
        # build temp data directory
        if os.path.exists(self.TEMP_PATH) == False:
            
            os.mkdir(self.TEMP_PATH)
            
        self._build_temp_data_directory()
        print('directory built successfully')
        
        # capture data
        data = self.camera.gather_data()
        print('data capture completed')
        
        # process data
        self._process_caputred_frames(data)
        print('data process completed')
        
        # load data
        images, labels = self._load_data()
        # print('data loaded.')
        
        # load model 
        model = models.CNNModel()
        print('model loaded')
        
        # tune model
        model.tune(X=images, y=labels)
        
        # output success
        print('calibration successful')
        
        if self.keep_data == False:
            
            self._remove_temp_data()
        
        return model
