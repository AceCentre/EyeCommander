import cv2
import numpy as np
from eye_commander.display_tools import display

class Camera:
    
    def __init__(self, source:int=0):
        self.camera = cv2.VideoCapture(source)
    
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
            frame = cv2.flip(frame, 1)
    
        return cam_status, frame
        
    def open(self):
        return self.camera.isOpened()
    
    def close(self):
        return self.camera.release()
    
    def capture_frames(self, n_frames:int = 100, drop_frames:int= 10):
        frame_count = 0
        data = []
        while (self.camera.isOpened()) and (frame_count < n_frames):
            cam_success, frame = self.refresh()
            if cam_success == True:
                data.append(frame)
                frame_count += 1
            display.draw_position_rect(frame=frame, color='red')
            cv2.imshow('EyeCommander', frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == ord('c'):
                break
        ##### drop first few frames
        data = data[drop_frames:]
        return data
    
    def gather_data(self):
        data = {'center':[],'down':[],'left':[],'right':[],'up':[]}
        ###### CAPTURING USER DATA #######
        font = cv2.FONT_HERSHEY_PLAIN
        font_color = (252, 158, 3)
        # opening
        while self.camera.isOpened():
            # capture a frame and extract eye images
            cam_success, frame = self.refresh()
            if cam_success == True:
                cv2.putText(frame, f'press N to begin calibration', org =(20, 210),  
                    fontFace=font, fontScale=3, color=font_color, thickness=6)
                display.draw_position_rect(frame=frame, color='green')
                cv2.imshow('EyeCommander', frame)
                
            if cv2.waitKey(1) & 0xFF == ord('n'):
                    # end demo when ESC key is entered 
                for direction in ['center', 'down', 'left', 'right', 'up']:
                    while self.camera.isOpened():
                        # capture a frame and extract eye images
                        cam_success, frame = self.refresh()
                        if cam_success == True:
                            cv2.putText(frame, f'press N to begin {direction} calibration', org =(20, 210),  
                                fontFace=font, fontScale=3, color=font_color, thickness=6) 
                            display.draw_position_rect(frame=frame, color='green')
                            cv2.imshow('EyeCommander', frame)
                            # end demo when ESC key is entered 
                        if cv2.waitKey(1) & 0xFF == ord('n'):
                            frames = self.capture_frames()
                            data[direction] = frames
                            break
                break
        
        return data
    

    
    