import numpy as np
import queue

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
    
    def consensus(self, prediction:int):
        """all_same returns True if all elements in the window 
        are the same. Used to determine intentional eye movement.add()

        Returns:
            bool: True or False
        """
        return (len(set(self.items))==1) and (self.items[0] == prediction)  

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
            

        

