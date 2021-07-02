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
    commander.frame = img
    commander.shape = commander.frame.shape
    commander._image_extraction()
    if commander.eye_status == False:
        return False
    else:
        left = commander.eye_left
        right = commander.eye_right
        cv2.imwrite(writepath1, img=left)
        cv2.imwrite(writepath2, img=right)
        return True

def dir_to_eye_images(base_readpath: str, base_writepath: str):
    commander = MP()
    for name in ['up','down','left','right','center']:
        readpath = base_readpath + name  
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

dir_to_eye_images(base_readpath='/Users/danielkashkett/Desktop/data/frames/', base_writepath='/Users/danielkashkett/Desktop/data/eye_imgs/')

