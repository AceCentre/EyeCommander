# import xgboost
import tensorflow as tf
import os
import numpy as np
from operator import itemgetter
import pickle 
from eye_commander.preprocessing import preprocessing
import glob
import cv2
import sys
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# https://stackoverflow.com/questions/56210408/location-of-the-added-files-after-the-executable-file-is-generated-by-pyinstalle
def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path.replace("/", "\\"))
    return os.path.join(os.path.abspath("."), relative_path.replace("/", "\\"))

class CNNModel:
    PATH = resource_path('eye_commander/models/trained_models/cnn_filtered.h5')
    
    def __init__(self):
        self.model = tf.keras.models.load_model(self.PATH)
        self.tuned_model = None
        self.image_processor = preprocessing.ImageProcessor()

    def _prep_batch(self, images: tuple):
        # preprocessing 
        eyes = self.image_processor.preprocess_eyes(images)
        # add batch dimension for tensorflow
        left = np.expand_dims(eyes[0], 0)
        right = np.expand_dims(eyes[1], 0)
        # combine left/right back into one batch
        batch = np.concatenate([left,right])
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
    
    def tune(self, X, y):
        #### prep model
        for layer in self.model.layers:
            layer.trainable = False
        self.model.layers[-1].trainable = True
        #### prep data
        X = self.image_processor.preprocess(X)
        X = [np.expand_dims(img,0) for img in X]
        X = np.concatenate(X)
        y = np.array(y)
        #### tune model
        self.model.fit(x= X, y=y, epochs=7, batch_size=5, shuffle=True)
        
        
        
        
        
        
# class RandomForest:
#     PATH = os.path.join(os.getcwd(),'eye_commander/models/trained_models/rf.sav')
    
#     def __init__(self):
#         self.model = pickle.load(open(self.PATH, 'rb'))
#         self.preprocessing = preprocessing.ImageProcessor()
        
#     def _prep_batch(self, images: tuple):
#         images = self.preprocessing.transform(images)
#         images = np.array(images)
#         reshaped = np.reshape(images,(images.shape[0], 
#                                     images.shape[1] * images.shape[2]))
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

# class Net:
#     PATH = os.path.join(os.getcwd(),'eye_commander/models/trained_models/dense.h5')
    
#     def __init__(self):
#         self.model = tf.keras.models.load_model(self.PATH)
#         self.feature_extractor = preprocessing.FeatureExtractor()
#         self.input_size = (50,80,3)
        
#     def _prep_batch(self, images: tuple):
#         imgs = []
#         for image in images:
#             image = np.array(tf.image.resize_with_crop_or_pad(image, target_height=50, target_width=80))
#             image = np.expand_dims(image,0)
#             imgs.append(image)
#         batch = np.concatenate(imgs)
#         features = self.feature_extractor.extract(batch)
#         return features
    
#     def predict(self, images: tuple):
#         batch = self._prep_batch(images)
#         predictions = self.model.predict(batch)
        
#         eye_predictions = [(predictions[0].max(), predictions[0].argmax()), 
#                         (predictions[1].max(), predictions[1].argmax())]
    
#         strongest_eye = max(eye_predictions, key=itemgetter(0))
#         probability = strongest_eye[0]
#         prediction = strongest_eye[1]

#         return prediction, probability
    
    
    # class XGBoostModel:
    #     PATH = os.path.join(os.getcwd(),'eye_commander/models/trained_models/xgboost2')
        
    #     def __init__(self):
    #         self.model = xgboost.XGBClassifier()
    #         self.model.load_model(self.PATH)
    #         self.preprocessing = preprocessing.ImageProcessor()
            
    #     def _prep_batch(self, images: tuple):
    #         images = self.preprocessing.transform(images)
    #         images = np.array(images)
    #         reshaped = np.reshape(images,(images.shape[0], 
    #                                     images.shape[1] * images.shape[2]))
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
