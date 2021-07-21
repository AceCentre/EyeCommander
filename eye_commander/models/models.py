import xgboost
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

class FeatureExtractor:
    def __init__(self):
        self.extractor = self.build_feature_extractor()
    
    def build_feature_extractor(self):
        mobile = tf.keras.applications.mobilenet_v2.MobileNetV2(include_top=False,weights='imagenet',input_shape=(50,80,3))
        for layer in mobile.layers:
            layer.trainable = False
        input_layer = tf.keras.Input(shape=(50, 80, 3))
        preprocess_layer = tf.keras.layers.experimental.preprocessing.Rescaling(1./255)(input_layer)
        mobilenet = mobile(preprocess_layer)
        features = tf.keras.layers.GlobalAveragePooling2D()(mobilenet)
        feature_extractor = tf.keras.Model(inputs=input_layer, outputs=features)
        return feature_extractor
    
    def extract(self, input_):
        features = self.extractor.predict(input_)
        return features

class EyeBoostNet:
    PATH = os.path.join(os.getcwd(),'eye_commander/models/XGB')
    
    def __init__(self):
        self.model = xgboost.XGBClassifier()
        self.model.load_model(self.PATH)
        self.feature_extractor = FeatureExtractor()
        self.input_size = (50,80,3)
        
    def _prep_batch(self, images: tuple):
        imgs = []
        for image in images:
            image = np.array(tf.image.resize_with_crop_or_pad(image, target_height=50, target_width=80))
            image = np.expand_dims(image,0)
            imgs.append(image)
        batch = np.concatenate(imgs)
        features = self.feature_extractor.extract(batch)
        return features
    
    def predict(self, images: tuple):
        batch = self._prep_batch(images)
        predictions = self.model.predict_proba(batch)
        
        eye_predictions = [(predictions[0].max(), predictions[0].argmax()), 
                        (predictions[1].max(), predictions[1].argmax())]
    
        strongest_eye = max(eye_predictions, key=itemgetter(0))
        probability = strongest_eye[0]
        prediction = strongest_eye[1]

        return prediction, probability