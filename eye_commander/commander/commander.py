from eye_commander.image_capture import image_capture
from eye_commander.face_detection import face_detection
from eye_commander.models import models
from eye_commander.prediction_window import prediction_window
from eye_commander.display_tools import display
from eye_commander.calibration import calibration
from eye_commander.keystroke import keystroke 
from eye_commander.utils.funcs import resource_path
import cv2 
import numpy as np
import os

class EyeCommander:
    
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    
    def __init__(self,  camera:int=0, confidence:float=0.9, 
                 log_output:bool=False, output_keys:bool=True,
                 calibrate:bool=True, keep_data:bool=True):
        
        self.camera = image_capture.Camera(source=camera)
        self.face_detection = face_detection.FaceDetector()
        self.prediction_window = prediction_window.Window()
        self.model = models.CNNModel()
        self.calibrator = calibration.Calibrator(keep_data=keep_data)
        self.confidence = confidence
        self.log_output = log_output
        self.output_keys = output_keys
        self.run_calibration = calibrate

    def _class_name(self,prediction):
        
        return self.CLASS_LABELS[prediction]
    
    def output_filter(self, prediction, probability):
        if probability > self.confidence:
            
            self.prediction_window.insert(prediction)
            
            if self.prediction_window.is_full() == True:
                
                consensus = self.prediction_window.consensus(prediction)
                
                if consensus == True:
                    
                    return prediction
    
    def log(self, frame, pred:int, proba:float):
        
        log = open(resource_path('eye_commander\log\log.txt'), "a")
        
        log.write(f'{pred}, {proba}, {np.mean(frame)} \n')
        
        log.close()
             
    def run(self):
        
        if self.run_calibration == True:
            
            self.model = self.calibrator.calibrate()
            
        while self.camera.open():
            
            success, frame = self.camera.refresh()
            
            if success == True:
                
                eyes = self.face_detection.eyes(frame)
                
                if eyes:  
                    
                    prediction, probability = self.model.predict(eyes)
                    output = self.output_filter(prediction, probability)
                    
                    if output:
                        
                        label = self._class_name(output)
                        display.display_prediction(label=label, frame=frame)
                    
                        if self.output_keys:
                            
                            keystroke.output_keystrokes(label)
                    
                    if self.log_output == True:
                        
                        self.log(frame=frame, pred=prediction, proba=probability)
                         
                    display.display_probability(frame=frame, probability=probability)
            
            display.draw_position_rect(frame=frame, color='green')
            
            cv2.imshow('EyeCommander', frame)
            
            # trigger calibration by hitting the c key
            if cv2.waitKey(5) & 0xFF == ord('c'):
        
                self.model = self.calibrator.calibrate()
            # end demo when ESC key is entered   
            if cv2.waitKey(5) & 0xFF == 27:
                break
            
        self.camera.close()
        
        cv2.destroyAllWindows()
        
        
