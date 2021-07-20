# import xgboost
import tensorflow as tf
import os
import numpy as np
from operator import itemgetter
import pickle 

# class XGBoostModel:
#     PATH = os.path.join(os.getcwd(),'eye_commander/models/xgboost2')
    
#     def __init__(self):
#         self.model = xgboost.XGBClassifier()
#         self.model.load_model(self.PATH)
        
#     def _prep_batch(self, images: tuple):
#         images = np.array(images)
#         reshaped = np.reshape(images,(images.shape[0], 
#                                       images.shape[1] * images.shape[2]))
#         return np.array(reshaped)
    
#     def predict(self, images: tuple):
#         batch = self._prep_batch(images)
#         predictions = self.model.predict_proba(batch)
        
#         eye_predictions = [(predictions[0].max(), predictions[0].argmax()), 
#                         (predictions[1].max(), predictions[1].argmax())]
    
#         strongest_eye = max(eye_predictions, key=itemgetter(0))
#         probability = strongest_eye[0]
#         prediction = strongest_eye[1]

#         return prediction, probability

class CNNModel:
    PATH = os.path.join(os.getcwd(),'eye_commander/models/cnn.h5')
    
    def __init__(self):
        self.model = tf.keras.models.load_model(self.PATH)
        self.tuned_model = None

    def _prep_batch(self, images: tuple):
        img1 = images[0].reshape((35,63))
        img2 = images[1].reshape((35,63))
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
    
class RandomForest:
    PATH = os.path.join(os.getcwd(),'eye_commander/models/rf.sav')
    
    def __init__(self):
        self.model = pickle.load(open(self.PATH, 'rb'))
        
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