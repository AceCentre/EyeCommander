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
        


class ImageUtil:
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    def __init__(self, readpath:str, writepath:str):
        self.preprocessing = preprocessing.ImageProcessor()
        self.face_detector = face_detection.FaceDetector(static=True, min_detection_confidence=0.5,
                                                         min_tracking_confidence=0.5) 
        self.readpath = readpath
        self.writepath = writepath
        
    def load_image(self, path):
        image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        corrected = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return corrected

    def crop_eyes(self, image):
        eyes = self.face_detector.eyes(image)
        return eyes
    
    def preprocess(self, eyes):
        processed_eyes = self.preprocessing.transform(eyes)
        return processed_eyes
    
    def write_images(self, eyes, path, count):
        try:
            left, right = Image.fromarray(eyes[0]), Image.fromarray(eyes[1])
            path1 = os.path.join(path, f'image{count}.jpg')
            path2 = os.path.join(path, f'image{count+1}.jpg')
            left.save(path1)
            right.save(path2)
            return True
        except:
            return False
    
    def build_dir(self):
        base = self.writepath
        if os.path.exists(base):
            shutil.rmtree(base)
        base = os.path.join(self.writepath)
        os.mkdir(base)
        
        for label in self.CLASS_LABELS:
            path = os.path.join(base, label)
            os.mkdir(path)
            
    def write_class(self, label:str):
        readpath = os.path.join(self.readpath, label)
        writepath = os.path.join(self.writepath, label)
        files = glob.glob(os.path.join(readpath, '*.jpg'))
        print(f'{len(files)*2} possible eye images for class: {label}')
        count = 0
        for path in files:
            image = self.load_image(path)
            eyes = self.crop_eyes(image)
            if eyes:
                success = self.write_images(eyes, writepath, count)
                if success == True:
                    count += 2
                else:
                    pass
            else:
                pass
        print(f'{count} images written successfully for class: {label}')
        # print(f'Error rate of {round((count/len(files)*2),2)} for class: {label}')
    
    def process(self):
        self.build_dir()
        for label in self.CLASS_LABELS:
            self.write_class(label)
            print(f'{label} completed...')
        print('processing complete.')
    

# util = ImageUtil(readpath='/Users/danielkashkett/Desktop/AceCentre/data/raw/frames/frames',
#                  writepath='/Users/danielkashkett/Desktop/AceCentre/data/eyes')
# util.process()
    
   
# ec = EyeCommander(calibrate=False) 
# dir_to_eye_images(base_readpath='/Users/danielkashkett/Desktop/AceCentre/data/raw/frames/frames', 
#                       base_writepath='/Users/danielkashkett/Desktop/AceCentre/data/processed/50_90/', commander=ec)
    


def add_to_dataset(user_data_path, dataset_path):
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    for label in CLASS_LABELS:
        readpath = os.path.join(user_data_path,label)
        writepath = os.path.join(dataset_path, label)
        files_to_move = glob.glob(os.path.join(readpath,'*.jpg'))
        destination_files = glob.glob(os.path.join(writepath,'*.jpg'))
        func = lambda x: int(''.join([i for i in x if i.isdigit()]))
        indx = max([func(i) for i in destination_files])
        for file in files_to_move:
            os.rename(src=file, dst=os.path.join(writepath, f'{label}{indx}.jpg'))
            indx += 1
            

def reset_filenames(dataset_path:str):
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    for label in CLASS_LABELS:
        readpath = os.path.join(dataset_path, label)
        files = glob.glob(os.path.join(readpath,'*.jpg'))
        count = 1
        for file in files:
            head = os.path.split(file)[0]
            os.rename(src=file, dst=os.path.join(head, f'{label}{count}.jpg'))
            count += 1

def change_filenames(dataset_path:str):
    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']
    for label in CLASS_LABELS:
        readpath = os.path.join(dataset_path, label)
        files = glob.glob(os.path.join(readpath,'*.jpg'))
        count = 1
        for file in files:
            head = os.path.split(file)[0]
            os.rename(src=file, dst=os.path.join(head, f'image{count}.jpg'))
            count += 1
    print('completed.')
        
        

