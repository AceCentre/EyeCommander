import cv2
import numpy as np

def draw_position_rect(frame:np.array, color:str):
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

def display_prediction(label:str, frame:np.array,
                       color:tuple = (252, 198, 3), font=cv2.FONT_HERSHEY_PLAIN):
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

def display_probability(frame:np.array, probability:float):
    cv2.putText(frame, str(round(probability,3)), 
                                (570, 680), cv2.FONT_HERSHEY_SIMPLEX, 2, (0,255,0), 2) 