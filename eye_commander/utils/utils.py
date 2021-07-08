import cv2
import os
import glob

def dir_to_frames(inpath, writepath):
    writepath = writepath
    files = [i for i in os.listdir(inpath) if i != '.DS_Store' and i != '.ipynb_checkpoints']
    count = 1
    for f in files:
        vidpath = os.path.join(inpath, f)
        vidcap = cv2.VideoCapture(vidpath)
        success,image = vidcap.read()
        framecount = 0
        while success:
            try:
                success,image = vidcap.read()
                cv2.imwrite(writepath + str(count)+"frame%d.jpg" % framecount, image)     # save frame as JPEG file      
                print('Read a new frame: ', success)
                framecount += 1
            except:
                pass
        count+=1


def extract_file(filepath: str, writepath1: str, writepath2: str, commander):
    img = cv2.imread(filepath, cv2.IMREAD_UNCHANGED)
    eyes = commander._eye_images_from_frame(img)
                # if detection is able to isolate eyes
    if eyes:
        eye_left, eye_right = eyes
        eye_left_processed, eye_right_processed = commander._preprocess_eye_images(eye_left, eye_right)
        cv2.imwrite(writepath1, img=eye_left_processed)
        cv2.imwrite(writepath2, img=eye_right_processed)
        return True
    else:
        return False

def dir_to_eye_images(base_readpath: str, base_writepath: str):
    commander = EyeCommander()
    commander.image_shape = (30,30,1)
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
    
# dir_to_eye_images(base_readpath='/Users/danielkashkett/Desktop/EyeProject/data/frames/', 
#                       base_writepath='/Users/danielkashkett/Desktop/EyeProject/data/micronet/')
    