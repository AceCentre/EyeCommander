import xgboost
import tensorflow as tf
import os
import numpy as np
from operator import itemgetter

class XGBoostModel:
    PATH = os.path.join(os.getcwd(),'eye_commander/models/xgboost2')
    
    def __init__(self):
        self.model = xgboost.XGBClassifier()
        self.model.load_model(self.PATH)
        
    def _prep_batch(self, images: tuple):
        images = np.array(images)
        reshaped = np.reshape(images,(images.shape[0], 
                                      images.shape[1] * images.shape[2]))
        return np.array(reshaped)
    
    def predict(self, images: tuple):
        batch = self._prep_batch(images)
        predictions = self.model.predict_proba(batch)
        
        eye_predictions = [(predictions[0].max(), predictions[0].argmax()), 
                        (predictions[1].max(), predictions[1].argmax())]
    
        strongest_eye = max(eye_predictions, key=itemgetter(0))
        probability = strongest_eye[0]
        prediction = strongest_eye[1]

        return prediction, probability

class CNNModel:
    PATH = os.path.join(os.getcwd(),'eye_commander/models/eyenet3.h5')
    
    def __init__(self):
        self.model = tf.keras.models.load_model(self.PATH)
        self.tuned_model = None
        self.input_shape = (80,80,3)
        
    def _prep_batch(self, images: tuple):
        img1 = images[0].reshape(self.image_shape)
        img2 = images[1].reshape(self.image_shape)
        img1 = np.expand_dims(img1,0)
        img2 = np.expand_dims(img2,0)
        batch = np.concatenate([img1,img2])
        
        return batch
    
    def predict(self, images: tuple):
        # make batch
        batch = self._prep_batch(images)
        # make prediction on batch -- returns two vectors
        predictions = self.model.predict(batch)
        #### select the prediction from the eye with higher probability
        eye_predictions = [(predictions[0].max(), predictions[0].argmax()), 
                   (predictions[1].max(), predictions[1].argmax())]
        strongest_eye = max(eye_predictions, key=itemgetter(0))
        probability = strongest_eye[0]
        prediction = strongest_eye[1]
        
        return prediction, probability