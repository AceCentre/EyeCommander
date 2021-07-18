import numpy as np

# class PredictionWindow(object):
    
#     def __init__(self, size=5):
#         self.size = size
#         self.items = []
        
#     def _add_center_bias(self, predictions:np.array, bias:float=0.2):
#         # this adds a bias to favor the center class
#         for pred in predictions:
#             if pred[0] + bias > 1:
#                 pred[0] = 1
#             else:
#                 pred[0] += bias
#         return predictions

#     def _mean_vec(self):
#         mean_scores = np.mean(self.items,axis=0)
#         return mean_scores
    
#     def window_mean(self):
#         size = int(self.size/3)
#         weights = weights = np.array([3, 1, 1, 1, 1])
#         window = self.items.copy()
#         window.sort(axis=0)
#         subset = window[:].copy()
#         mean = np.mean(subset, axis =0)
#         weighted_mean = mean * weights
#         for i,j in enumerate(weighted_mean):
#             if j > 1:
#                 weighted_mean[i] = 1
#         return weighted_mean
        
#     def insert(self, predictions):
#         if self.is_empty() == True:
#             self.items = predictions
#         elif (len(self.items) == self.size):
#             self.items = np.concatenate([predictions, self.items])
#             self.items = self.items[:-2].copy()
#         elif (len(self.items) == self.size -1):
#             self.items = np.concatenate([predictions, self.items])
#             self.items = self.items[:-1].copy()
#         else:
#             self.items = np.concatenate([predictions, self.items])
        
#     def predict(self):
#         mean_scores = self._mean_vec()
#         pred = mean_scores.argmax()
#         mean_proba = mean_scores.max()
#         return pred, mean_proba
    
#     def is_full(self):
#         return len(self.items) == self.size
    
#     def is_empty(self):
#         return len(self.items) == 0
    
#     def stats(self):
#         mean = np.mean(self.items, axis =0)
#         std = np.std(self.items, axis=0)
#         preds = list(zip(mean,std, [0,1,2,3,4]))
#         preds.sort(key=lambda x: (x[1], -x[0]))
#         return preds[0]
    

class Window:
    def __init__(self, size:int=4):
        self.size = size
        self.items = []
        self.prob = []
    
    def is_full(self):
        """is_full returns true if the window is full

        Returns:
            bool: True or False
        """
        return len(self.items)==self.size
    
    def is_empty(self):
        """is_empty returns True if there are no items in window

        Returns:
            bool: True or False
        """
        return len(self.items) ==0
    
    def consensus(self):
        """all_same returns True if all elements in the window 
        are the same. Used to determine intentional eye movement.add()

        Returns:
            bool: True or False
        """
        if len(set(self.items))==1:
            return self.items[0]

    def insert(self, prediction:int):
        """insert adds the current frame prediction to the window

        Args:
            prediction (int): prediction of current frame.
        """

        if self.is_full() == True:
            self.items.insert(0,prediction)
            self.items.pop()
        else:
            self.items.append(prediction)
    
    def insert_probability(self, prediction:int):
        """insert adds the current frame prediction to the window

        Args:
            prediction (int): prediction of current frame.
        """

        if len(self.prob) == self.size:
            self.prob.insert(0,prediction)
            self.prob.pop()
        else:
            self.prob.append(prediction)
        

        

