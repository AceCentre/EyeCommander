import pyglet
import cv2
import os
import shutil
import tensorflow as tf
from detection import eye_detection

class Configuration:
    
    TEMP_DATAPATH = './temp'
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    SOUND  = pyglet.media.load("./sounds/ding.mp3", streaming=False)
    
    def __init__(self, train_size:int=800, train_epochs:int=12, camera=cv2.VideoCapture(0)):
        self.camera = camera
        self.train_size = train_size
        self.train_epochs = train_epochs
        self.eye_detection = eye_detection.EyeDetector()
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
                self.SOUND.play()
                message = f'slowly look {direction}!'
                self._display_text(message=message, rect_color=(0,255,0))
                
            elif (frame_count >= start_delay) and (len(collected_frames) < n_frames):
                message = f'look {direction}!' 
                self._display_text(message=message, rect_color=(0,255,0))
                collected_frames.append(self.eye_left)
                collected_frames.append(self.eye_right)
                
            elif (len(collected_frames) == n_frames) and (stage_completed == False):
                self.SOUND.play()
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
        
    def configure(self):
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