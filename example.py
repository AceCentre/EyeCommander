# from eye_commander.commander.commander import EyeCommander
# from eye_commander.utils.utils import dir_to_eye_images, video_dir_to_frames


from eye_commander.commander.experimental import EyeCommander

#### To capture data run eyecommander with keep_data = True
ec = EyeCommander()
ec.run()   
