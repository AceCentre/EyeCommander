# import xgboost
import tensorflow as tf
import os
import numpy as np
from operator import itemgetter
from eye_commander.preprocessing import preprocessing
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

class CNNModel:
    
    PATH = os.path.join(os.getcwd(),'eye_commander/models/trained_models/cnn_filtered.h5')
    
    def __init__(self):
        
        self.model = tf.keras.models.load_model(self.PATH)
        self.tuned_model = None
        self.image_processor = preprocessing.ImageProcessor()

    def _prep_batch(self, images: tuple):
        """ preprocesses and reshapes data to correct format for 
        tensorflow inference

        Args:
            images (tuple): tuple consisting of left,right eye images   

        Returns:
            np.array : np.array with dimensions (2, h, w)
        """
        # preprocessing 
        eyes = self.image_processor.preprocess(images)
        
        # add batch dimension for tensorflow
        left = np.expand_dims(eyes[0], 0)
        right = np.expand_dims(eyes[1], 0)
        
        # combine left/right back into one batch
        batch = np.concatenate([left,right])
        
        return batch
    
    def predict(self, images: tuple):
        """ uses prediction vectors from tensorflow model, selects and outputs the 
        prediction with the highest probability. input is the (left,right) eye image tuple.

        Args:
            images (tuple): tuple of array image data for left and right eye

        Returns:
            prediction (int): predicted class
            probability (float): probability for predicted class
        """
        # make batch
        batch = self._prep_batch(images)
        
        # make prediction on batch -- returns two vectors
        pred_vecs = self.model.predict(batch)
        
        #### select the prediction from the eye with higher probability
        left_pred = (pred_vecs[0].max(), pred_vecs[0].argmax())
        
        right_pred = (pred_vecs[1].max(), pred_vecs[1].argmax())
        
        probability, prediction = max([left_pred, right_pred], key=itemgetter(0))
        
        return prediction, probability
    
    def tune(self, X, y):
        """ tunes self.model to user image data

        Args:
            X (np.array): array of images
            y (np.array): array of labels
        """
        #### prep model
        # make all but the output layer untrainable
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
        
        