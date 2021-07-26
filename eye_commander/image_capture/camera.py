import cv2
import numpy as np

class Camera:
    
    def __init__(self, source=cv2.VideoCapture(0)):
        self.camera = source
    
    def refresh(self):
        """refresh uses the default or specified camera passed to EyeCommander on initialization.
        The intention is to be used as a wrapper for OpenCV .read() method.

        Returns:
            tuple(iterable): the first element, display_frame, is used only for display purposes,
            the second element, frame, is the raw data which will be used for eye detection.
        """                                   
        cam_status, frame = self.camera.read()
        # Stop if no video input
        
        if cam_status == True:
            frame.flags.writeable = False
            output_frame = cv2.flip(frame, 1)
        
        return cam_status, output_frame
        
    
    def open(self):
        return self.camera.isOpened()
    
    def close(self):
        return self.camera.release()
        
    