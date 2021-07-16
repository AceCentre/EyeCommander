import cv2
import shutil 
import glob
import os
from pynput.keyboard import Key, Controller
from typing import Tuple
import mediapipe as mp
import tensorflow as tf
import xgboost 
from collections import Counter
import numpy as np
from operator import itemgetter
from eye_commander.detection import detection
from eye_commander.classification import classification

class EyeCommander:

    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    TEMP_DATAPATH = os.path.join(os.getcwd(),'eye_commander/temp')
    
    def __init__(self, window_size:int=5, image_shape:tuple =(90,50,3),
                 n_frames:int=100, base_model_path:str='eye_commander/models/eyenet3.h5', 
                 calibrate:bool=True, keep_data:bool=False):
    
        self.camera = cv2.VideoCapture(0)
        self.eye_detection = detection.Meshy()
        self.window = classification.Window(size=window_size)
        self.base_model_path = os.path.join(os.getcwd(),base_model_path)
        self.model = None
        self.image_shape = image_shape
        self.n_frames = n_frames
        self.calibrate = calibrate
        self.keep_data = keep_data
          
    def refresh(self):
        """refresh uses the default or specified camera passed to EyeCommander on initialization.
        The intention is to be used as a wrapper for OpenCV .read() method.

        Returns:
            tuple(iterable): the first element, display_frame, is used only for display purposes,
            the second element, frame, is the raw data which will be used for eye detection.
        """                                   
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

    def _eye_images_from_frame(self, frame:np.array):
        """_eye_images_from_frame is a wrapper for the extract_eyes method in the
        EyeDetector class.

        Args:
            frame (np.array): raw data returned from the refresh        

        Returns:
            tuple(iterable): tuple consisting of two cropped eye images
            None: returns None if eye detection fails  
        """
        eyes = self.eye_detection.extract_eyes(frame)
        if eyes:
            return eyes
        else:
            return None

    def _preprocess(self, eye_left:np.array, eye_right:np.array):
        """_preprocess prepares eye images for classification by 
        resizing, reshaping, and doing appropriate color transformation
        
        Args:
            eye_left (np.array): unprocessed image data from left eye
            eye_right (np.array): unprocessed image data from right eye

        Returns:
           tuple(iterable) : processed image data for left and right eye
        """                     
        shape = self.image_shape
        #### if shape of desired image is 1 dimensional, turn image grayscale
        if shape[-1] == 1:
            # gray 
            eye_left = cv2.cvtColor(eye_left, cv2.COLOR_BGR2GRAY)
            eye_right =  cv2.cvtColor(eye_right, cv2.COLOR_BGR2GRAY)
        ### if shape of desired image is 3D, convert images to RGB
        elif shape[-1] == 3:
            # color 
            eye_left = cv2.cvtColor(eye_left, cv2.COLOR_BGR2RGB)
            eye_right =  cv2.cvtColor(eye_right, cv2.COLOR_BGR2RGB)
        # resize
        resized_left = cv2.resize(eye_left, shape[:2])
        resized_right = cv2.resize(eye_right, shape[:2])
        # reshape
        reshaped_left = resized_left.reshape((shape))
        reshaped_right = resized_right.reshape(shape)
        
        return (reshaped_left, reshaped_right)
    
    def preprocess(self, eye_left:np.array, eye_right:np.array):
        """_preprocess prepares eye images for classification by 
        resizing, reshaping, and doing appropriate color transformation
        
        Args:
            eye_left (np.array): unprocessed image data from left eye
            eye_right (np.array): unprocessed image data from right eye

        Returns:
           tuple(iterable) : processed image data for left and right eye
        """                     
        # shape = self.image_shape
        # #### if shape of desired image is 1 dimensional, turn image grayscale
        # if shape[-1] == 1:
        #     # gray 
        #     eye_left = cv2.cvtColor(eye_left, cv2.COLOR_BGR2GRAY)
        #     eye_right =  cv2.cvtColor(eye_right, cv2.COLOR_BGR2GRAY)
        # ### if shape of desired image is 3D, convert images to RGB
        # elif shape[-1] == 3:
        #     # color 
        #     eye_left = cv2.cvtColor(eye_left, cv2.COLOR_BGR2RGB)
        #     eye_right =  cv2.cvtColor(eye_right, cv2.COLOR_BGR2RGB)
        # # resize
        resized_left = cv2.resize(eye_left, (80,40))
        resized_right = cv2.resize(eye_right, (80,40))
        
        return (resized_left, resized_right)
    
    def _capture_data(self, drop_frames:int= 10):
        """_capture_data is used in the autocalibration function to record 
        frames for a specific direction. The frames are used for tuning the model.add()
        The number of frames is set by the arg n_frames specified during initialization.

        Args:
            drop_frames (int, optional): Number of frames to remove from the beginning of capture.
            Users generally don't look in the correct direction immediately. Defaults to 10.

        Returns:
            list([iterable]): list of np.array elements, each a frame captured by camera
        """
        frame_count = 0
        data = []
        while (self.camera.isOpened()) and (frame_count < self.n_frames):
            camera_output = self.refresh()
            if camera_output:
                display_frame, frame = camera_output
                eyes = self._eye_images_from_frame(frame)
                if eyes:
                    eye_left, eye_right = eyes
                    eye_left_processed, eye_right_processed = self._preprocess(eye_left, eye_right)
                    data.extend([eye_left_processed, eye_right_processed])
                    frame_count += 1
            self._position_rect(display_frame, color='red')
            cv2.imshow('EyeCommander', display_frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                break
        ##### drop first few frames
        data = data[drop_frames:]
        return data

    def _build_directory(self):
        """_build_directory generates the nested directory structure that will be used
        to store user data for tuning.
        """
        basepath = os.path.join(self.TEMP_DATAPATH,'data')
        # delete any leftover temp data from the last session
        if os.path.exists(basepath) == True:
            shutil.rmtree(basepath)
        os.mkdir(basepath)
        for label in self.CLASS_LABELS:
            newpath = os.path.join(basepath,label)
            os.mkdir(newpath)
                
    def _prepare_captured_data(self, direction:str, data:list):
        """_prepare_captured_data writes the data captured by the _capture_data method
        to its appropriate directory created by _build_directory method

        Args:
            direction (str): the specific eye direction that the data represents
            data (list): list of np.array elements, each a frame captured by camera
        """
        basepath = os.path.join(self.TEMP_DATAPATH,'data')
        class_path = os.path.join(basepath,direction)
        count = 1
        for image in data:
            cv2.imwrite(os.path.join(class_path,f'{direction}{count}.jpg'), image)
            count += 1
            
    def _position_rect(self, frame:np.array, color:str):
        """_position_rect is a helper function used to display a rectangle intended to 
        guide users where to place their head.

        Args:
            frame (np.array): the numpy display_frame used for display only
            color (str): desired color for rectangle and inner text
        """
        if color == 'green':
            color = (0,255,0)
        if color == 'red':
            color = (0,0,255)
        cv2.rectangle(frame,(420,20),(900,700),color,3)
        cv2.putText(frame, "center head inside box", 
                        (470, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 1)
     
    def _load_user_data(self, path:str):
        """_load_user_data loads data captured during calibration.

        Args:
            path (str): filepath to temporary data directory

        Returns:
            np.array: numpy array of images
            np.array: numpy array of labels
        """
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
        # max_size = max(shapes.values())
        # if balance == True:
        #     for key, val in shapes.items():
        #         diff = max_size - val
        #         if diff <= 0:
        #             continue
        #         else:
        #             smpl_idxs = np.random.randint(0, val-1, size=diff)
        #             samples = self._add_augmentation(d[key][smpl_idxs])
        #             d[key] = np.concatenate([d[key],samples])
        #     shapes = {key:val.shape[0] for key,val in d.items()}
        images = []
        labels = []
        for key, val in d.items():
            images.extend(list(val))
            labels.extend([key]*len(val))
        images = np.array(images)
        labels = np.array(labels)
        print('output dataset size: ',shapes)
        return images, labels

    def _load_model(self, path:str):
        """_load_model is a wrapper for keras load_model method. It loads 
        and sets all layers except the classification layer as untrainable.

        Args:
            path (str): file path to trained model

        Returns:
            tf.keras.model: tensorflow model
        """
        print(f'loading model: {path[-13:]}')
        model = tf.keras.models.load_model(path)
        if self.calibrate == True:
            for i in range(len(model.layers)):
                model.layers[i].trainable = False
            model.layers[-1].trainable = True
        return model

    def _tune_model(self, model, X:np.array, y:np.array):
        """_tune_model is a wrapper for tensorflow's fit method.

        Args:
            model (tensorflow.python.keras.engine.functional.Functional): trained tensorflow function model
            X (np.array): array of images
            y (np.array): array of labels

        Returns:
            model: trained model
        """
        print('tuning model')
        model.fit(x= X, y=y, epochs=7, batch_size =5, shuffle=True)
        return model
    
    def auto_calibrate(self):
        """auto_calibrate uses several class methods to capture user data and 
        tune a custom model for that user.

        Returns:
            model: custom tuned model
        """
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
                            data = self._capture_data()
                            self._prepare_captured_data(direction=direction, data=data)
                            break
                break
            
        ####### MODEL TUNING ########
        self.model = self._load_model(self.base_model_path)
        X, y = self._load_user_data(os.path.join(self.TEMP_DATAPATH,'data'))
        model = self._tune_model(self.model, X, y)
        model.save(os.path.join(self.TEMP_DATAPATH, 'custom_model.h5'))
        if self.keep_data == False:
            if os.path.exists(os.path.join(self.TEMP_DATAPATH,'data')) == True:
                shutil.rmtree(os.path.join(self.TEMP_DATAPATH,'data'))
        return model

    def _prep_batch(self, images: tuple):
        """_prep_batch takes in tuple of (eye_left, eye_right) processed eye images and returns
        an array in the appropriate format for tensorflow inference.

        Args:
            images (tuple): tuple of np.array elements, (eye_left, eye_right)

        Returns:
            np.array: array with appropriate dimensions for tensorflow inference
        """
        img1 = images[0].reshape(self.image_shape)
        img2 = images[1].reshape(self.image_shape)
        img1 = np.expand_dims(img1,0)
        img2 = np.expand_dims(img2,0)
        batch = np.concatenate([img1,img2])
        return batch
    
    def _predict_batch(self, batch:np.array):
        """_predict_batch is a wrapper for tensorflows .predict method.

        Args:
            batch (np.array): batch of images created by _prep_batch method.

        Returns:
            np.array: array consisting of two vectors, each containing the probability for each class
        """
        predictions = self.model.predict(batch)
        return predictions   
            
    def predict(self, eye_left:np.array, eye_right:np.array):
        """predict takes in the processed eye_left and eye_right data, creates a batch, makes a prediction
        on each eye, accepts the prediction with the highest probability, and returns that prediction 
        and probability. 

        Args:
            eye_left (np.array): processed image data for left eye
            eye_right (np.array): processed image data for right eye

        Returns:
            int: prediction of class, 0-4
            float: probability of prediction
        """
        # make batch
        batch = self._prep_batch((eye_left, eye_right))
        # make prediction on batch -- returns two vectors
        predictions = self._predict_batch(batch)
        #### select the prediction from the eye with higher probability
        eye_predictions = [(predictions[0].max(), predictions[0].argmax()), 
                   (predictions[1].max(), predictions[1].argmax())]
        strongest_eye = max(eye_predictions, key=itemgetter(0))
        proba = strongest_eye[0]
        pred = strongest_eye[1]
        return pred, proba
             
    def _display_prediction(self, label:str, frame:np.array, color:tuple = (252, 198, 3), font=cv2.FONT_HERSHEY_PLAIN):
        """_display_prediction is generates the text output of predictions for the run method.

        Args:
            label (str): predicted label either ['center', 'down', 'left', 'right', 'up']
            frame (np.array): display_frame
            color (tuple, optional): color of text. Defaults to (252, 198, 3).
            font ([type], optional): text font. Defaults to cv2.FONT_HERSHEY_PLAIN.
        """
        if label == 'left':
            cv2.putText(frame, "left", (50, 375), font , 7, color, 15)
        elif label == 'right':
            cv2.putText(frame, "right", (900, 375), font, 7, color, 15)
        elif label == 'up':
            cv2.putText(frame, "up", (575, 100), font, 7, color, 15)
        elif label == 'down':
            cv2.putText(frame, "down", (500, 700), font, 7, color, 15)
        else:
            pass
   
    def _output_keystrokes(self, label:str):
        """_output_keystrokes works just like _display_prediction only it outputs keystrokes for each class prediction
        instead of text.

        Args:
            label (str): predicted label
        """
        keyboard = Controller()
        if label == 'left':
            keyboard.press(Key.left)
            keyboard.release(Key.left)    
        elif label == 'right':
            keyboard.press(Key.right)
            keyboard.release(Key.right)
        elif label == 'up':
            keyboard.press(Key.up)
            keyboard.release(Key.up)
        elif label == 'down':
            keyboard.press(Key.down)
            keyboard.release(Key.down)
        else:
            pass
    
    def classify(self, images):
        shape = images.shape
        images = np.reshape(images,(shape[0], shape[1] * shape[2]))
        predictions = self.model.predict_proba(images)
        eye_predictions = [(predictions[0].max(), predictions[0].argmax()), 
                        (predictions[1].max(), predictions[1].argmax())]
        strongest_eye = max(eye_predictions, key=itemgetter(0))
        proba = strongest_eye[0]
        pred = strongest_eye[1]

        return pred, proba

    def run(self):
        """demo
        """
        if self.calibrate == True:
            self.model = self.auto_calibrate() 
        ### if calibrate set to false look for custom model, then base model
        else:
            # if os.path.exists(os.path.join(self.TEMP_DATAPATH, 'custom_model.h5')) == True:
            #     self.model = self._load_model(os.path.join(self.TEMP_DATAPATH, 'custom_model.h5'))
            # else:
            #     self.model = self._load_model(self.base_model_path)
            model = xgboost.XGBClassifier()
            model.load_model(os.path.join(os.getcwd(),'eye_commander/models/xgboost2'))
            self.model = model
        while self.camera.isOpened():
            # capture a frame and extract eye images
            camera_output = self.refresh()
            # if the camera is outputing images
            if camera_output:
                display_frame, frame = camera_output
                frame = cv2.flip(frame, 1)
                # try to detect eyes
                eyes = self._eye_images_from_frame(frame)
                if eyes:
                    # if detection is able to isolate eyes
                    eye_left, eye_right = eyes
                    # eye_left_processed, eye_right_processed = self.preprocess(eye_left, eye_right)
                    eye_left_processed, eye_right_processed = eye_left, eye_right
                    cv2.imshow('eye', eye_left)
                   
                    #### make classifcation based on eye images
                    # pred, proba = self.predict(eye_left_processed, eye_right_processed)
                    images = np.array([eye_left_processed, eye_right_processed])
                    pred, proba = self.classify(images)
                    if proba > 0.8:
                        self.window.insert(pred)
                        self.window.insert_probability(proba)
                        #### if all of the prediction in the window are the same ####
                        if (self.window.all_same()==True) and (self.window.items[0]==pred) and (np.mean(self.window.prob)>0.9):
                            label = self.CLASS_LABELS[pred]
                            self._display_prediction(label=label, frame=display_frame)
                            self._output_keystrokes(label=label)
                        #### display probability of current frame
                        cv2.putText(display_frame, str(round(proba,3)), 
                                (510, 680), cv2.FONT_HERSHEY_SIMPLEX, 2, (0,255,0), 2) 
                        
                # display suggested head placement box
                self._position_rect(display_frame,color='green')
                cv2.imshow('EyeCommander', display_frame)
            # end demo when ESC key is entered 
            if cv2.waitKey(5) & 0xFF == 27:
                if self.keep_data == False:
                    if os.path.exists(os.path.join(self.TEMP_DATAPATH, 'data')):
                        shutil.rmtree(os.path.join(self.TEMP_DATAPATH, 'data'))
                break
        self.camera.release()
        cv2.destroyAllWindows()
        if self.keep_data == False:
            if os.path.exists(os.path.join(self.TEMP_DATAPATH, 'data')):
                shutil.rmtree(os.path.join(self.TEMP_DATAPATH, 'data'))

