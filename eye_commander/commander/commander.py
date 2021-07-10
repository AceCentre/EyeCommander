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

class EyeCommander:
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    TEMP_DATAPATH = os.path.join(os.getcwd(),'eye_commander/temp')
    # BASE_MODEL_PATH = os.path.join(os.getcwd(),'eye_commander/models/best_model_aug.h5')
    
    def __init__(self, base_model=None, window_size:int=12, image_shape:tuple =(80,80,3),
                 n_frames:int=200, epochs:int=10, batch_size:int=32, base_model_path:str='eye_commander/models/eyenet'):
        
        self.camera = cv2.VideoCapture(0)
        self.eye_detection = detection.EyeDetector()
        self.prediction_window = classification.PredictionWindow(size=window_size)
        self.window_size = window_size
        self.base_model_path = os.path.join(os.getcwd(),base_model_path)
        self.base_model = base_model
        self.tuned_model = None
        self.image_shape = image_shape
        self.n_frames = n_frames
        self.epochs = epochs
        self.batch_size = batch_size
        self.calibration_done = False
          
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
        # eye_left = cv2.cvtColor(eye_left, cv2.COLOR_BGR2GRAY)
        # eye_right =  cv2.cvtColor(eye_right, cv2.COLOR_BGR2GRAY)
        # resize
        resized_left = cv2.resize(eye_left, shape[:2])
        resized_right = cv2.resize(eye_right, shape[:2])
        # reshape
        reshaped_left = resized_left.reshape(shape)
        reshaped_right = resized_right.reshape(shape)
        
        return reshaped_left, reshaped_right
    
    def capture_data(self):
        frame_count = 0
        data = []
        while (self.camera.isOpened()) and (frame_count < self.n_frames):
            camera_output = self.refresh()
            if camera_output:
                display_frame, frame = camera_output
                eyes = self._eye_images_from_frame(frame)
                if eyes:
                    eye_left, eye_right = eyes
                    eye_left_processed, eye_right_processed = self._preprocess_eye_images(eye_left, eye_right)
                    data.extend([eye_left_processed, eye_right_processed])
                    frame_count += 1
            self._position_rect(display_frame, color='red')
            cv2.imshow('EyeCommander', display_frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                break
        return data
    
    def _add_augmentation(self, data:list):
        for idx, img in enumerate(data):
            aug_img = tf.image.random_brightness(img,max_delta=0.3)
            aug_img = np.array(aug_img)
            if (aug_img.mean() > 210) or (aug_img.mean() < 50):
                continue
            else:
                data.append(aug_img)
            return data

    def _build_directory(self):
        basepath = os.path.join(self.TEMP_DATAPATH,'data')
        # delete any leftover temp data from the last session
        if os.path.exists(basepath) == True:
            shutil.rmtree(basepath)
        os.mkdir(basepath)
        for label in self.CLASS_LABELS:
            newpath = os.path.join(basepath,label)
            os.mkdir(newpath)
                
    def _process_captured_data(self, direction:str, data:list):
        basepath = os.path.join(self.TEMP_DATAPATH,'data')
        class_path = os.path.join(basepath,direction)
        count = 1
        for image in data:
            cv2.imwrite(os.path.join(class_path,f'{direction}{count}.jpg'), image)
            count += 1
            
    def _position_rect(self, frame, color:str):
        if color == 'green':
            color = (0,255,0)
        if color == 'red':
            color = (0,0,255)
        cv2.rectangle(frame,(420,20),(900,700),color,3)
        cv2.putText(frame, "center head inside box", 
                        (470, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 1)
        
    def _add_augmentation(self, arr):
        for idx in range(len(arr)):
            img = arr[idx]
            img = np.array(tf.image.random_brightness(img,max_delta=0.3))
            while (img.mean() > 210) or (img.mean() < 50):
                img = np.array(tf.image.random_brightness(img,max_delta=0.3))
            arr[idx] = img
        return arr

    def _load_user_data(self, path, balance:bool=True):
        d = {}
        for idx, l in enumerate(['center', 'down', 'left', 'right', 'up']):
            subpath = os.path.join(path, l)
            files = glob.glob(subpath + '/*.jpg')
            data = []
            for f in files:
                img = cv2.imread(f, cv2.IMREAD_UNCHANGED)
                data.append(img)
            d[idx] = np.array(data)
        shapes = {key:val.shape[0] for key,val in d.items()}
        max_size = max(shapes.values())
        if balance == True:
            for key, val in shapes.items():
                diff = max_size - val
                if diff <= 0:
                    continue
                else:
                    smpl_idxs = np.random.randint(0, val-1, size=diff)
                    samples = self._add_augmentation(d[key][smpl_idxs])
                    d[key] = np.concatenate([d[key],samples])
            shapes = {key:val.shape[0] for key,val in d.items()}

        images = []
        labels = []
        for key, val in d.items():
            images.extend(list(val))
            labels.extend([key]*len(val))
        images = np.array(images)
        labels = np.array(labels)
        print('output dataset size: ',shapes)
        return images, labels

    def _load_model_for_tuning(self, path):
        print('loading model')
        model = tf.keras.models.load_model(path)
        for i in range(len(model.layers)):
            model.layers[i].trainable = False
        model.layers[-1].trainable = True
        return model

    def _tune_model(self, model, X, y):
        model.fit(x= X, y=y, epochs=10, batch_size =32, shuffle=True)
        return model
        
    # def _retrain(self, model):
    #     train_ds = tf.keras.preprocessing.image_dataset_from_directory(self.TEMP_DATAPATH, validation_split=0.2, 
    #                                                                    color_mode="grayscale", subset="training", 
    #                                                                    seed=123, image_size=self.image_shape[:2], 
    #                                                                    batch_size=self.batch_size,label_mode='int',shuffle=True)

    #     val_ds = tf.keras.preprocessing.image_dataset_from_directory(self.TEMP_DATAPATH, validation_split=0.2, 
    #                                                                  color_mode="grayscale", subset="validation", 
    #                                                                  seed=123, image_size=self.image_shape[:2], 
    #                                                                  batch_size=self.batch_size, label_mode='int', shuffle=True)
        
    #     model.fit(train_ds, validation_data=val_ds, batch_size=self.batch_size, epochs=self.epochs)
    #     # model.save('./temp/temp_model')
    #     return model
    
    def auto_calibrate(self):
        ###### CAPTURING USER DATA #######
        font = cv2.FONT_HERSHEY_PLAIN
        font_color = (252, 158, 3)
        # build directory
        self._build_directory()
        # opening
        while self.camera.isOpened():
            # capture a frame and extract eye images
            camera_output = self.refresh()
            if camera_output:
                display_frame, frame = camera_output
                cv2.putText(display_frame, f'press esc to begin calibration', org =(20, 210),  
                    fontFace=font, fontScale=3, color=font_color, thickness=6)
                self._position_rect(display_frame, color='green')
                cv2.imshow('EyeCommander', display_frame)
                
            if cv2.waitKey(1) & 0xFF == 27:
                    # end demo when ESC key is entered 
                for direction in ['center', 'down', 'left', 'right', 'up']:
                    while self.camera.isOpened():
                        # capture a frame and extract eye images
                        camera_output = self.refresh()
                        if camera_output:
                            display_frame, frame = camera_output
                            cv2.putText(display_frame, f'press esc to begin {direction} calibration', org =(20, 210),  
                                fontFace=font, fontScale=3, color=font_color, thickness=6) 
                            self._position_rect(display_frame, color='green')
                            cv2.imshow('EyeCommander', display_frame)

                            # end demo when ESC key is entered 
                        if cv2.waitKey(1) & 0xFF == 27:
                            data = self.capture_data()
                            self._process_captured_data(direction=direction, data=data)
                            break
                break
            
        ####### MODEL TUNING ########
        self.base_model = self._load_model_for_tuning(self.base_model_path)
        X, y = self._load_user_data(os.path.join(self.TEMP_DATAPATH,'data'), balance=True)
        model = self._tune_model(self.base_model, X, y)
        # if os.path.exists(os.path.join(self.TEMP_DATAPATH,'data')) == True:
        #     shutil.rmtree(os.path.join(self.TEMP_DATAPATH,'data'))
        return model

    def _prep_batch(self, images: tuple):
        img1 = images[0].reshape(self.image_shape)
        img2 = images[1].reshape(self.image_shape)
        img1 = np.expand_dims(img1,0)
        img2 = np.expand_dims(img2,0)
        batch = np.concatenate([img1,img2])
        return batch
    
    def _predict_batch(self, batch:np.array):
        if self.calibration_done == True:
            predictions = self.tuned_model.predict(batch)
        else:
            predictions = self.base_model.predict(batch)
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
            self.tuned_model = self.auto_calibrate() 
            self.calibration_done = True 
        else:
            self.base_model = tf.keras.models.load_model(self.base_model_path)
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
                    if (self.prediction_window.is_full() == True):
                        label = self.CLASS_LABELS[prediction]
                        self._display_prediction(label=label, frame=display_frame)
                # display suggested head placement box
                cv2.rectangle(display_frame,(420,20),(900,700),(100,175,255),3)
                cv2.putText(display_frame, "center head inside box", 
                        (470, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (100,175,255), 1)
                cv2.imshow('EyeCommander', display_frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                shutil.rmtree('./temp/data')
                break
                
        self.camera.release()
        cv2.destroyAllWindows()
 