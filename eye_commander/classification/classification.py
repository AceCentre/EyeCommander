import numpy as np

class PredictionWindow(object):
    
    def __init__(self, size=5):
        self.size = size
        self.items = []
    
    def insert_prediction(self, prediction):
        if len(self.items) == self.size:
            self.items.insert(0,prediction)
            self.items.pop()
        else:
            self.items.append(prediction)
            
    def insert_predictions(self, predictions):
        pred_list = list(predictions)
        if (len(self.items) == self.size):
            self.items.insert(0,pred_list[0])
            self.items.insert(1,pred_list[1])
            self.items.pop()
            self.items.pop() 
        elif (len(self.items) == self.size -1):
            self.items.insert(0,pred_list[0])
            self.items.insert(1,pred_list[1])
            self.items.pop()
        else:
            self.items.extend(pred_list)
    
    def predict(self):
        window = np.array(self.items)
        mean_scores = np.mean(window,axis=0)
        pred = mean_scores.argmax()
        mean_proba = mean_scores.max()
        return pred, mean_proba
    
    def is_full(self):
        return len(self.items) == self.size


