# from eye_commander.commander.commander import EyeCommander
# from eye_commander.utils.utils import dir_to_eye_images, video_dir_to_frames


from eye_commander.commander.commander import EyeCommander
from eye_commander.preprocessing import preprocessing
from eye_commander.face_detection import face_detection
import os
import glob
import cv2
from PIL import Image

#### To capture data run eyecommander with keep_data = True
ec = EyeCommander()
ec.run()   


# def extract_file(filepath: str, writepath1: str, writepath2: str):
#     ip = preprocessing.ImageProcessor()
#     fd = face_detection.FaceDetector(static=True)
#     img = cv2.imread(filepath, cv2.IMREAD_UNCHANGED)
#     eyes = fd.eyes(img)
#     if eyes: 
#         processed_eyes = ip.transform(eyes)
#         if processed_eyes:
#             eye_left, eye_right = processed_eyes
#             cv2.imwrite(writepath1, img=eye_left)
#             cv2.imwrite(writepath2, img=eye_right)
#             return True
#     else:
#         return False

# def dir_to_eye_images(base_readpath: str, base_writepath: str):
#     if os.path.exists(base_writepath) == False:
#         os.mkdir(base_writepath)
#     for class_name in ['up','down','left','right','center']:
#         readpath = os.path.join(base_readpath,class_name) 
#         print(readpath)
#         files = glob.glob(readpath + '/*.jpg')
#         writepath = os.path.join(base_writepath,class_name)
#         os.mkdir(writepath)
#         count = 0
#         for file in files:
#             wp1 = os.path.join(writepath, 'a'+ str(count)+ '.jpg')
#             wp2 = os.path.join(writepath, 'b'+ str(count)+ '.jpg')
#             success = extract_file(file, wp1, wp2)
#             if success == False:
#                 continue 
#             else:
#                 count+=1
#         print(f'done {class_name}.')

# # dir_to_eye_images(base_readpath='/Users/danielkashkett/Desktop/AceCentre/data/raw/frames/frames', 
# #                       base_writepath='/Users/danielkashkett/Desktop/AceCentre/data/processed/seg/')

# ip = preprocessing.ImageProcessor()
# fd = face_detection.FaceDetector(static=True)

# class_ = 'center'
# base = '/Users/danielkashkett/Desktop/AceCentre/data/raw/frames/frames'  
# write = '/Users/danielkashkett/Desktop/AceCentre/data/processed/seg3/'

# files = glob.glob(base +f'/{class_}' + '/*.jpg')
# print(f'{len(files)} files in read directory, {len(files)*2} possible samples.')
# errors = 0
# write_count = 0
# for idx, file in enumerate(files):
#     img = cv2.imread(file, cv2.IMREAD_UNCHANGED)
#     eyes = fd.eyes(img)
#     if eyes:
#         # processed = ip.transform(eyes)
#         # if processed:
#         left, right = eyes
#         left, right = Image.fromarray(left), Image.fromarray(right)
#         w1 = f'/Users/danielkashkett/Desktop/AceCentre/data/processed/seg3/{class_}/image{idx}a.jpg'
#         w2 = f'/Users/danielkashkett/Desktop/AceCentre/data/processed/seg3/{class_}/image{idx}b.jpg'
#         left.save(w1)
#         right.save(w2)
#         write_count+=2
#     else:
       
#         errors+=1
# print(f'detection errors: {errors}')
# print(f'{write_count} files written successfuly')
   
                
