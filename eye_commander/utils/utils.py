import cv2
import os
import glob
from eye_commander.commander.commander import EyeCommander



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


def extract_file(filepath: str, writepath1: str, writepath2: str, commander):
    img = cv2.imread(filepath, cv2.IMREAD_UNCHANGED)
    eyes = commander.eye_detection.extract_eyes(img)
    if eyes:
        eye_left, eye_right = eyes

        cv2.imwrite(writepath1, img=eye_left)
        cv2.imwrite(writepath2, img=eye_right)
        return True
    else:
        return False

def dir_to_eye_images(base_readpath: str, base_writepath: str, commander):
    os.mkdir(base_writepath)
    for name in ['up','down','left','right','center']:
        readpath = os.path.join(base_readpath,name) 
        print(readpath)
        files = glob.glob(readpath + '/*.jpg')
        writepath = os.path.join(base_writepath,name)
        os.mkdir(writepath)
        count = 0
        for file in files:
            wp1 = os.path.join(writepath, 'a'+ str(count)+ '.jpg')
            wp2 = os.path.join(writepath, 'b'+ str(count)+ '.jpg')
            success = extract_file(file, wp1, wp2, commander)
            if success == False:
                continue 
            else:
                count+=1
        print(f'done {name}.')
   
# ec = EyeCommander(calibrate=False) 
# dir_to_eye_images(base_readpath='/Users/danielkashkett/Desktop/AceCentre/data/raw/frames/frames', 
#                       base_writepath='/Users/danielkashkett/Desktop/AceCentre/data/processed/50_90/', commander=ec)
    
