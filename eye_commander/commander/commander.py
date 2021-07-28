from eye_commander.image_capture import image_capture
from eye_commander.face_detection import face_detection
from eye_commander.models import models
from eye_commander.prediction_window import prediction_window
from eye_commander.display_tools import display
from eye_commander.calibration import calibration
import cv2 

class EyeCommander:
    
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    
    def __init__(self, confidence:float=0.9):
        self.camera = image_capture.Camera()
        self.face_detection = face_detection.FaceDetector()
        self.prediction_window = prediction_window.Window()
        self.model = models.CNNModel()
        self.calibrator = calibration.Calibrator()
        self.confidence = confidence
        
    def _class_name(self,prediction):
        return self.CLASS_LABELS[prediction]
    
    def output_filter(self, prediction, probability):
        if probability > self.confidence:
            self.prediction_window.insert(prediction)
            if self.prediction_window.is_full() == True:
                consensus = self.prediction_window.consensus(prediction)
                if consensus == True:
                    return prediction
                   
    def run(self, calibrate:bool=True):
        if calibrate == True:
            self.model = self.calibrator.calibrate()
        while self.camera.open():
            success, frame = self.camera.refresh()
            if success == True:
                eyes = self.face_detection.eyes(frame)
                if eyes:  
                    prediction, probability = self.model.predict(eyes)
                    cv2.imshow('frame',eyes[0])
                    output = self.output_filter(prediction, probability)
                    if output:
                        label = self._class_name(output)
                        display.display_prediction(label=label, frame=frame)
                        
                    display.display_probability(frame=frame, probability=probability)
            
            display.draw_position_rect(frame=frame, color='green')
            cv2.imshow('EyeCommander', frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                break
        self.camera.close()
        cv2.destroyAllWindows()
        
        
