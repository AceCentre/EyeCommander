from eye_commander.image_capture import image_capture
from eye_commander.face_detection import face_detection
from eye_commander.models import models
from eye_commander.prediction_window import prediction_window
from eye_commander.display_tools import display
from eye_commander.calibration import calibration
from eye_commander.keystroke import keystroke
from eye_commander.vjoy_switch import vjoy_switch
from eye_commander.utils.funcs import resource_path
from eye_commander.sounds import sounds
import cv2
import numpy as np
import os


class EyeCommander:

    CLASS_LABELS = ['center', 'down', 'left', 'right', 'up']

    def __init__(self,  camera: int = 0, confidence: float = 0.9,
                 log_output: bool = False, output_keys: bool = True,
                 output_vjoyswitch: bool = False,
                 calibrate: bool = True, keep_data: bool = True,
                 sounds: bool = True, directions: list = ['center', 'down', 'left', 'right', 'up']):

        self.camera = image_capture.Camera(source=camera)
        self.face_detection = face_detection.FaceDetector()
        self.prediction_window = prediction_window.Window(size=6)
        self.model = models.CNNModel()
        self.calibrator = calibration.Calibrator(keep_data=keep_data)
        self.confidence = confidence
        self.log_output = log_output
        self.output_keys = output_keys
        self.output_vjoyswitch = vjoy_switch
        self.run_calibration = calibrate
        self.sounds = sounds
        self.directions = directions
        if 'center' not in self.directions:
            self.directions.append('center')

    def _class_name(self, prediction):
        """converts prediction output into class name string

        Args:
            prediction (int): tensorflow argmax for predicted class

        Returns:
            str: corresponding class name
        """
        return self.CLASS_LABELS[prediction]

    def output_filter(self, prediction, probability):
        """filters current frame prediction based on threshold specified in initialization. 
        Predictions in a window of time must agree, i.e. be the same, otherwise
        function will return False.

        Args:
            prediction (int): tensorflow argmax prediction
            probability (float): probability for predicted class

        Returns:
            bool: True or False depending on whether prediction meets criteria
        """
        # check if prediction proba > than a threshold
        if probability > self.confidence:
            # add prediction to window
            self.prediction_window.insert(prediction)
            # if window is equal to desired window size
            if self.prediction_window.is_full() == True:
                # determine if all predictions over that window are in aggreement
                consensus = self.prediction_window.consensus(prediction)
                # consensus will return False if predictions disagree
                if consensus == True:

                    if self._class_name(prediction) in self.directions:
                        # return the prediction
                        return prediction

    def log(self, frame, pred: int, proba: float):
        """log

        Args:
            frame (np.array): numpy array representation of current frame
            pred (int): tensorflow argmax of prediction
            proba (float): prediction probability
        """
        # open file
        log = open(resource_path('eye_commander\log\log.txt'), "a")
        # write contents
        log.write(f'{pred}, {proba}, {np.mean(frame)} \n')
        # close file
        log.close()

    def run(self):
        """ main application entrypoint
        """
        # run calibration if parameter specified
        if self.run_calibration == True:

            self.model = self.calibrator.calibrate(directions=self.directions)

        frame_count = 0
        skip = None
        label_state = None
        # open camera lense
        while self.camera.open():
            # attempt to capture a frame
            success, frame = self.camera.refresh()
            # if successful
            if success == True:
                # run face/eye detection on the captured frame
                eyes = self.face_detection.eyes(frame)
                # if variable eyes contains tuple of images and not None
                if eyes:
                    # make a prediction based on the eye images
                    prediction, probability = self.model.predict(eyes)
                    # determine if prediction proba is > than proba threshold
                    output = self.output_filter(prediction, probability)
                    # if so, output will be a prediction and not None
                    if output:
                        # get class label from integer prediction value
                        label = self._class_name(output)
                        # if not in a current label state
                        if not skip or frame_count >= skip:
                            # reset frame_count
                            frame_count = 0
                            # set label_state
                            label_state = label
                            # skip inference on the next 8 frames
                            skip = frame_count + 12
                            # play sound if param set
                            if self.sounds == True:
                                sounds.play(label=label)
                            # output keystroke if param set
                            if self.output_keys:
                                keystroke.output_keystrokes(label=label)
                            # output vjoy switch press if param set
                            # NB: WINDOWS ONLY AND REQUIRES VJOY INSTALLED
                            if self.output_vjoyswitch:
                                switches = {'up': 1, 'right': 2,
                                            'down': 3, 'left': 4, 'center': 5}
                                if label in switches:
                                    vjoy_switch.Switch_Press_Release(
                                        switches[label])

                    # if not in a current label state but there is no prediction
                    elif not skip or frame_count >= skip:
                        # set label state to None
                        label_state = None

                    # display probability regardless of whether it exceeds threshold
                    display.display_probability(
                        frame=frame, probability=probability)

                    # log prediction, probability, mean_pixel if param set
                    if self.log_output == True:

                        self.log(frame=frame, pred=prediction,
                                 proba=probability)

            # if currently in a label state
            if label_state:
                # display label
                display.display_prediction(label=label_state, frame=frame)

            # draw guid for head placement
            display.draw_position_rect(frame=frame, color='white')
            # show frame
            cv2.imshow('EyeCommander', frame)
            # iterate the frame count
            frame_count += 1

            # trigger calibration by hitting the c key
            if cv2.waitKey(1) & 0xFF == ord('c'):

                self.model = self.calibrator.calibrate(
                    directions=self.directions)

            # end demo when ESC key is entered
            if cv2.waitKey(1) & 0xFF == 27:
                break

        self.camera.close()

        cv2.destroyAllWindows()
