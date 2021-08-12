import cv2
import numpy as np
from eye_commander.display_tools import display
from eye_commander.sounds import sounds

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
        """ wrapper for cv2 isOpened function
        """
        return self.camera.isOpened()
    
    def close(self):
        """ wrapper for cv2 method release, realeases the camera
        """
        return self.camera.release()
    
    def capture_frames(self, n_frames:int = 100, drop_frames:int= 10):
        """ capture_frames opens the specified camera and captures a specified 
        number of frames. There is an option to drop the firs n frames 
        as these are often poor examples.

        Args:
            n_frames (int): number of frames to capture. Defaults to 100.
            drop_frames (int): number of frames to drop. Defaults to 10.

        Returns:
            list: list of image arrays
        """
        
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
        """gather_data automates the frame capture process by using the
        capture_frames method for each of the classes gathering data 
        to tune the model.

        Returns:
            dict: dictionary with class names as keys and lists of images as values
        """
        data = {'center':[],'down':[],'left':[],'right':[],'up':[]}
        ###### CAPTURING USER DATA #######
        
        # opening
        while self.camera.isOpened():
            # capture a frame and extract eye images
            
            cam_success, frame = self.refresh()
            
            if cam_success == True:
                
                display.draw_position_rect(frame=frame, color='green')
                
                display.display_text(frame=frame,text='press N to begin calibration')
                
                cv2.imshow('EyeCommander', frame)
                
            if cv2.waitKey(1) & 0xFF == ord('n'):
                    # end demo when ESC key is entered 
                    
                for direction in ['center', 'down', 'left', 'right', 'up']:
                    sounds.play_tone() ####
                    while self.camera.isOpened():
                        
                        # capture a frame and extract eye images
                        
                        cam_success, frame = self.refresh()
                        
                        if cam_success == True:
                            
                            display.draw_position_rect(frame=frame, color='green')
                            
                            display.display_text(frame=frame, text=f'press N to begin {direction} calibration')
                            
                            cv2.imshow('EyeCommander', frame)
                            # end demo when ESC key is entered 
                        if cv2.waitKey(1) & 0xFF == ord('n'):
                            if direction == 'center':
                                sounds.play_center()
                            else:
                                sounds.play(direction)
                            frames = self.capture_frames()
                            data[direction] = frames
                            break
                break
        
        sounds.play_tone()
        
        return data
    

    
    