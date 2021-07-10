from eye_commander.commander import commander
from eye_commander.utils.utils import dir_to_eye_images, video_dir_to_frames

cmder = commander.EyeCommander()
# cmder.n_frames = 200
cmder.run(calibrate=True)   


# cmder = commander.EyeCommander()
# cmder.image_shape = (80,80,3)
# dir_to_eye_images(base_readpath='/Users/danielkashkett/Desktop/AceCentre/data/raw/frames/test_frames', 
#                       base_writepath='/Users/danielkashkett/Desktop/AceCentre/data/processed/color80_test', 
#                       commander=cmder)

# import os
# import glob
# import cv2


# subject = 1


# dir_to_eye_images(base_readpath=f'/Users/danielkashkett/Desktop/AceCentre/data/raw/eye_videos/subject{subject}', 
#                       base_writepath=f'/Users/danielkashkett/Desktop/AceCentre/data/raw/eye_frames/subjects/subject{subject}',
#                       commander=cmder)
    

