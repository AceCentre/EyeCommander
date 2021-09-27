from eye_commander.commander.commander import EyeCommander
from eye_commander.preprocessing import preprocessing
from eye_commander.face_detection import face_detection
import os
import glob
import cv2
from PIL import Image
import shutil

def video_dir_to_frames(writepath, video_dir_path):
    os.mkdir(writepath)
    for label in ['center','up','down','left','right']:
        newpath = os.path.join(writepath,label)
        os.mkdir(newpath)
        files = glob.glob(video_dir_path + f'/{label}*.mov')
        print(files)
        for file in files:
            vidcap = cv2.VideoCapture(file)
            success,image = vidcap.read()
            frame_count = 1
            while success:
                try:
                    success,image = vidcap.read()
                    cv2.imwrite(os.path.join(newpath, f'frame{str(frame_count)}.jpg'), image)     # save frame as JPEG file      
                    frame_count += 1
                except: 
                    pass



  

