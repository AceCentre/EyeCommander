from eye_commander.image_capture import camera
from eye_commander.face_detection import face_detection
from eye_commander.preprocessing import preprocessing
from eye_commander.models import models
from eye_commander.prediction_window import prediction_window
from eye_commander.display_tools import tools
import cv2 

class EyeCommander:
    
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    
    def __init__(self):
        self.camera = camera.Camera()
        self.face_detection = face_detection.FaceDetector()
        self.image_processor = preprocessing.ImageProcessor()
        self.prediction_window = prediction_window.Window()
        self.model = models.CNNModel()
    
    def _class_name(self,prediction):
        return self.CLASS_LABELS[prediction]
    
    def output_filter(self, prediction, probability):
        if probability > 0.85:
            self.prediction_window.insert(prediction)
            if self.prediction_window.is_full() == True:
                consensus = self.prediction_window.consensus(prediction)
                if consensus == True:
                    return prediction
                            
    def run(self):
        while self.camera.camera.isOpened():
            success, frame = self.camera.refresh()
            if success == True:
                eyes = self.face_detection.eyes(frame)
                if eyes:
                    cv2.imshow('eye', eyes[0])
                    processed_eyes = self.image_processor.transform(eyes)
        
                    cv2.imshow('eye2', processed_eyes[0])
                    prediction, probability = self.model.predict(processed_eyes)
                    output = self.output_filter(prediction, probability)
                    if output:
                        label = self._class_name(output)
                        tools.display_prediction(label=label, frame=frame)
            
            tools.draw_position_rect(frame=frame, color='green')
            cv2.imshow('EyeCommander', frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                break
        self.camera.camera.release()
        
        
        