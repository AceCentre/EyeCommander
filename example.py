from eye_commander.commander.commander import EyeCommander
from eye_commander.utils.utils import dir_to_eye_images, video_dir_to_frames



ec = EyeCommander(calibrate=True)
ec.run()   



