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
from eye_commander.detection import detection
from eye_commander.classification import classification
from pkg_resources import resource_filename

# sound = pyglet.media.load('./sounds/ding.mp3', streaming=False)

class EyeCommander:
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    TEMP_DATAPATH = './temp'
    BASE_MODEL_PATH = os.path.join(os.getcwd(),'eye_commander/models/jupiter2')
    
    def __init__(self, model=None, window_size: int =12, image_shape:tuple =(100,100,1)):
        self.camera = cv2.VideoCapture(0)
        self.calibration = Calibration()
        self.eye_detection = detection.EyeDetector()
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
                    if (self.prediction_window.is_full() == True) and (mean_proba > 0.7):
                        label = self.CLASS_LABELS[prediction]
                        self._display_prediction(label=label, frame=display_frame)
                    cv2.imshow('eye', eye_left)
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
        
class Exp(EyeCommander):
    TEMP_DATAPATH = './temp'
    def __init__(self):
        super().__init__(self)
        
    def capture_data(self, n_frames:int):
        key = input('hit enter to begin')
        if key:
            frame_count = 0
            data = []
            while (self.camera.isOpened()) and (frame_count < n_frames):
                camera_output = self.refresh()
                if camera_output:
                    display_frame, frame = camera_output
                    eyes = self._eye_images_from_frame(frame)
                    if eyes:
                        eye_left, eye_right = eyes
                        eye_left_processed, eye_right_processed = self._preprocess_eye_images(eye_left, eye_right)
                        data.extend([eye_left_processed, eye_right_processed])
                        frame_count += 1
                cv2.imshow('frame', display_frame)
                # end demo when ESC key is entered 
                if cv2.waitKey(5) & 0xFF == 27:
                    break
            return data

class Calibration:
    
    TEMP_DATAPATH = './temp'
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    
    # SOUND  = pyglet.media.load(os.path.join(os.getcwd(),'eye_commander/sounds/ding.mp3'), streaming=False)
    
    def __init__(self, train_size:int=800, train_epochs:int=12, camera=cv2.VideoCapture(0)):
        self.camera = camera
        self.train_size = train_size
        self.train_epochs = train_epochs
        self.eye_detection = detection.EyeDetector()
        self.frame = None
        self.display_frame = None
        self.cam_status = False
        self.eye_status = False
        self.center_frames = None
        self.up_frames = None
        self.down_frames = None
        self.right_frames = None
        self.left_frames = None 
    
    def _refresh(self):
        self.cam_status, self.frame = self.camera.read()
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
            
    def update(self):
        self.cam_status, self.frame = self.camera.read()
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
            return [self.display_frame, self.eye_left, self.eye_right]
        else:
            return None
    
    def _display_text(self, message, rectangle=True, rect_color =(0,0,255)):
        if len(message) < 30:
            pos1 = 515
        else:
            pos1 = 20
            
        if rectangle == True:
            cv2.rectangle(self.display_frame,(420,20),(900,700),rect_color,3)
            cv2.putText(self.display_frame, "center head inside box", 
                        (470, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, rect_color, 1)
        cv2.putText(self.display_frame, message, org =(pos1, 110),  
                        fontFace=cv2.FONT_HERSHEY_PLAIN, 
                        fontScale=3, color=(252, 158, 3),
                        thickness=6) 
        
    # def gen_data(self, direction:str, n_frames:int):
    #     frame_count = 0
    #     data = []
    #     while (self.camera.isOpened()) and (frame_count < n_frames):
    #         output = self.update()
    #         if output:
    #             display, eye_left, eye_right = output 
    #             data.extend([eye_left, eye_right])
    #             frame_count += 1
    #         cv2.imshow('frame', display_frame)
    #         # end demo when ESC key is entered 
    #         if cv2.waitKey(5) & 0xFF == 27:
    #             break
    #     return data
    
    def exp(self):
        # d ={'up':self.up_frames, 'down':self.down_frames, 
        #  'right':self.right_frames,'left':self.left_frames,
        #  'center':self.center_frames}
        self.center_frames = self.gen_data(direction='center')
        self.up_frames = self.gen_data(direction='up')
        self.down_frames = self.gen_data(direction='down')
        self.right_frames = self.gen_data(direction='right')
        self.left_frames = self.gen_data(direction='left')
        
        
        
    def _gen_retrain_data(self, direction:str):
        
        n_frames = self.train_size
        setup_delay = 100
        start_delay = 200
        end_delay = 30
        frame_count = 0
        collected_frames = []
        stage_completed = False
        
        while self.camera.isOpened():
            # capture a frame and extract eye images
            self._refresh()
            if (self.cam_status == False) or (self.eye_status == False):
                continue
            
            if frame_count < setup_delay:
                    message = 'get ready'
                    self._display_text(message=message)
            
            elif (frame_count >= setup_delay) and (frame_count < start_delay):
                message = f'look {direction} when box turns green, until beep.'
                self._display_text(message=message)
            
            elif frame_count == start_delay:
                # self.SOUND.play()
                message = f'slowly look {direction}!'
                self._display_text(message=message, rect_color=(0,255,0))
                
            elif (frame_count >= start_delay) and (len(collected_frames) < n_frames):
                message = f'look {direction}!' 
                self._display_text(message=message, rect_color=(0,255,0))
                collected_frames.append(self.eye_left)
                collected_frames.append(self.eye_right)
                
            elif (len(collected_frames) == n_frames) and (stage_completed == False):
                # self.SOUND.play()
                message = 'good work!' 
                self._display_text(message=message, rectangle=False)
                end_delay = end_delay + frame_count
                stage_completed = True
                
            elif (len(collected_frames) == n_frames) and (frame_count<end_delay):
                message = 'good work!'
                self._display_text(message=message, rectangle=True)
                
            else:
                if direction == 'up':
                    self.up_frames = collected_frames
                elif direction == 'down':
                    self.down_frames = collected_frames
                elif direction == 'center':
                    self.center_frames = collected_frames
                elif direction == 'right':
                    self.right_frames = collected_frames
                else:
                    self.left_frames = collected_frames
                break
            frame_count += 1
           
            cv2.imshow('frame', self.display_frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                break
    
    def _process_dataset(self):
        d ={'up':self.up_frames, 'down':self.down_frames, 
         'right':self.right_frames,'left':self.left_frames,
         'center':self.center_frames}
        basepath = os.path.join(self.TEMP_DATAPATH,'data')
        os.mkdir(basepath)
        for label in self.CLASS_LABELS:
            newpath = os.path.join(basepath,label)
            os.mkdir(newpath)
            count = 1
            for img in d[label]:
                cv2.imwrite(os.path.join(newpath,f'{label}{count}.jpg'), img)
                count += 1

    def _load_model_for_retrain(self, path:str='./models/jupiter2'):
        model = tf.keras.models.load_model(path)
        # make all but last two layers untrainable
        for i in range(0,10):
            model.layers[i].trainable = False
        model.compile(optimizer="adam", 
                loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                metrics=['accuracy'])
        return model
    
    def _retrain(self, model):
        batch_size = 32
        img_height = 100
        img_width = 100

        train_ds = tf.keras.preprocessing.image_dataset_from_directory('./temp/data', validation_split=0.1, 
                                                                       color_mode="grayscale", subset="training", 
                                                                       seed=123, image_size=(img_height, img_width), 
                                                                       batch_size=batch_size)

        val_ds = tf.keras.preprocessing.image_dataset_from_directory('./temp/data', validation_split=0.1, 
                                                                     color_mode="grayscale", subset="validation", 
                                                                     seed=123, image_size=(img_height, img_width), 
                                                                     batch_size=batch_size)
        
        model.fit(train_ds, validation_data=val_ds, batch_size=batch_size, epochs=12)
        # model.save('./temp/temp_model')
        return model
        
    def calibrate(self):
        directions = self.CLASS_LABELS
        for direction in directions:
            self._gen_retrain_data(direction=direction)
        # self.camera.release()
        cv2.destroyAllWindows()
        
        print('processing images')
        self._process_dataset()
        print('images processed')
        
        base_model = self._load_model_for_retrain()
        model = self._retrain(base_model)
        if os.path.exists('./temp/data') == True:
            shutil.rmtree('./temp/data')
        print('configuration completed.')
        return model

if __name__ == "__main__":
    pass
    
    
    


