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
    elif color == 'red':
        color = (0,0,255)
    elif color == 'white':
        color = (255,255,255)
    
    h, w = np.shape(frame)[:2]
    top_r = (int(w*.32),int(h*.05))
    bottom_l = (int(w*.68),int(h*.95))
    text = (int(w*.35),int(h*.1))
    cv2.rectangle(frame, top_r, bottom_l, color,3)
    cv2.putText(frame, "center head inside box", 
                    text, cv2.FONT_HERSHEY_SIMPLEX, 1, color, 1)


def display_prediction(label:str, frame:np.array,
                       color:tuple = (252, 198, 3), font=cv2.FONT_HERSHEY_PLAIN):
    """_display_prediction is generates the text output of predictions for the run method.

    Args:
        label (str): predicted label either ['center', 'down', 'left', 'right', 'up']
        frame (np.array): display_frame
        color (tuple, optional): color of text. Defaults to (252, 198, 3).
        font ([type], optional): text font. Defaults to cv2.FONT_HERSHEY_PLAIN.
    """
    h, w = np.shape(frame)[:2]
    centerx = int((w//2))
    centery = int(int(h//2)*1.1)
    leftx = int(w*.02)
    rightx = int(w*.76)
    upy = int(h*.12)
    downy = int(h*.95)
    
    if label == 'left':
        cv2.putText(frame, "left", (leftx, centery), font , 7, color, 15)
    elif label == 'right':
        cv2.putText(frame, "right", (rightx, centery), font, 7, color, 15)
    elif label == 'up':
        cv2.putText(frame, "up", (int(centerx*.89), upy), font, 7, color, 15)
    elif label == 'down':
        cv2.putText(frame, "down", (int(centerx*.78), downy), font, 7, color, 15)
    else:
        pass

def display_probability(frame:np.array, probability:float):
    h, w = np.shape(frame)[:2]
    cv2.putText(frame, str(round(probability,3)), 
                                (int(w*.83), int(h*.1)), cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 3) 
    
def display_text(frame, text, color=(255, 255, 255)):
    h, w = np.shape(frame)[:2]
    # centerx = int((w//2))
    centery = int(int(h//2))
    leftx = int(w*.02)
    # rightx = int(w*.76)
    
    cv2.putText(frame, text, (leftx, centery), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)