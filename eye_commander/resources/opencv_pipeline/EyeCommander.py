import cv2
import numpy as np
import dlib
from math import hypot
from Face_Detection.FaceDetection import FaceDetector
from Frame_Pre_Processing.FramePreProcessing import preProcess
from ROI_Isolation.ROI_Isolation import Isolate_ROI
from Eye_Tracking.Eye_tracking import eyeCenterTracking
from CV_Classification.Eye_directions import Classifier
import pyglet

center_sound    = pyglet.media.load("Sound_prompts//center.mp3", streaming=False)
up_sound        = pyglet.media.load("Sound_prompts//up.mp3", streaming=False)
down_sound      = pyglet.media.load("Sound_prompts//down.mp3", streaming=False)
left_sound      = pyglet.media.load("Sound_prompts//left.mp3", streaming=False)
right_sound     = pyglet.media.load("Sound_prompts//right.mp3", streaming=False)
one_sound       = pyglet.media.load("Sound_prompts//1.mp3", streaming=False)
two_sound       = pyglet.media.load("Sound_prompts//2.mp3", streaming=False)
three_sound     = pyglet.media.load("Sound_prompts//3.mp3", streaming=False)
look_sound      = pyglet.media.load("Sound_prompts//look.mp3", streaming=False)
completed_sound = pyglet.media.load("Sound_prompts//completed.mp3", streaming=False)
keep_sound      = pyglet.media.load("Sound_prompts//keep.mp3", streaming=False)

class EyeCommander(object):
    def __init__(self, camera=cv2.VideoCapture(0)):
        self.camera = camera
        self.face_detector = FaceDetector()
        self.rightEyeClassifier = Classifier()
        self.leftEyeClassifier = Classifier()
        self.font = cv2.FONT_HERSHEY_PLAIN
        self.processed_frame = None
        self.frame = None
        self.face_detected = False
        self.face_box = None
        self.eye_left = None
        self.eye_right = None
        self.eye_right_cnt = None
        self.eye_right_center = None
        self.eye_left_cnt = None
        self.eye_left_center = None
        self.frame_count = 0

    def process_image(self):
        self.processed_frame = preProcess(
            self.frame,
            clipLimit=3,
            tileGridSize=(11, 11),
            kernelSize=11,
            blurType=0,
            threshold=False,
        )

    def detect_face(self):
        face_detected = self.face_detector.detect(self.processed_frame)

        if face_detected == True:
            self.eye_left = self.face_detector.eye_left
            self.eye_right = self.face_detector.eye_right
            self.face_box = self.face_detector.face_box
        return face_detected

    def track_eyes(self):
        self.eye_right = Isolate_ROI(self.eye_right, self.processed_frame)
        self.eye_left = Isolate_ROI(self.eye_left, self.processed_frame)
        self.eye_right_cnt, self.eye_right_center, self.eye_right = eyeCenterTracking(
            self.eye_right, drawFigures=True
        )
        self.eye_left_cnt, self.eye_left_center, self.eye_left = eyeCenterTracking(
            self.eye_left, drawFigures=True
        )
        return None

    def midpoint(self, p1, p2):
        return int((p1.x + p2.x)/2), int((p1.y + p2.y)/2)

    def EyeAspectRatio(self, eye_points):
        left_point = (self.face_detector.landmarks.part(eye_points[0]).x, self.face_detector.landmarks.part(eye_points[0]).y)
        right_point = (self.face_detector.landmarks.part(eye_points[3]).x, self.face_detector.landmarks.part(eye_points[3]).y)
        center_top = self.midpoint(self.face_detector.landmarks.part(eye_points[1]), self.face_detector.landmarks.part(eye_points[2]))
        center_bottom = self.midpoint(self.face_detector.landmarks.part(eye_points[5]), self.face_detector.landmarks.part(eye_points[4]))
        cv2.line(self.frame, left_point, right_point, (0, 255, 0), 2)
        cv2.line(self.frame, center_top, center_bottom, (0, 255, 0), 2)
        hor_line_lenght = hypot((left_point[0] - right_point[0]), (left_point[1] - right_point[1]))
        ver_line_lenght = hypot((center_top[0] - center_bottom[0]), (center_top[1] - center_bottom[1]))
        return hor_line_lenght / ver_line_lenght

	# Made a simple calibration countdown, it works assuming 1 sec equals 20 frames, as well as added the classifier for the left eye but it works the same with the right eye
    def make_classification(self, ratio):
        if self.frame_count <= 100:
            if 0 <= self.frame_count <= 40:
                cv2.putText(self.frame, "Look at the camera after the count", (10, 100), self.font, 2, (0, 0, 255), 3)
                if self.frame_count == 0:
                    look_sound.play()
            elif self.frame_count <= 60:
                cv2.putText(self.frame, "1", (10, 100), self.font, 2, (0, 0, 255), 3)
                if self.frame_count == 46:
                    one_sound.play()
            elif self.frame_count <= 80:
                cv2.putText(self.frame, "2", (10, 100), self.font, 2, (0, 0, 255), 3)
                if self.frame_count == 61:
                    two_sound.play()
            elif self.frame_count <= 100:
                cv2.putText(self.frame, "3", (10, 100), self.font, 2, (0, 0, 255), 3)
                if self.frame_count == 81:
                    three_sound.play()
        elif self.frame_count <= 180:
            cv2.putText(self.frame, "Keep Looking!", (10, 100), self.font, 2, (0, 0, 255), 3)
            if self.frame_count == 101:
                 keep_sound.play()
            # calls the calibration function
            self.leftEyeClassifier.findCenterAverage(self.frame_count, self.eye_left_center, self.eye_left_cnt, ratio)
        else:
            if self.frame_count <= 200:
               cv2.putText(self.frame, "Calibration completed!", (10, 100), self.font, 2, (0, 0, 255), 3)
               if self.frame_count == 181:
                    completed_sound.play()
            # calls the classify function
            self.leftEyeClassifier.classify(self.frame_count, self.eye_left_center, self.eye_left_cnt, ratio)
        return self.leftEyeClassifier.direction

    def run_demo(self):
        flag = ''
        x, y = 0, 0
        while self.camera.isOpened():
            success, self.frame = self.camera.read()
            height, width, _ = self.frame.shape
            #self.frame = cv2.flip(self.frame, 1)
            # Stop if no video input
            if not success:
                break
            
            # Class Function Calls
            self.process_image()
            faceDetected = self.detect_face()

            if faceDetected == True:
                try:
                    self.track_eyes()
                    ratio = self.EyeAspectRatio([36, 37, 38, 39, 40, 41])
                    result = self.make_classification(ratio)
                    if self.frame_count > 220:
                        if flag != result:
                            if result == "up":
                               x, y = int(width/2), 30
                               up_sound.play()
                            elif result == "down":
                               x, y = int(width/2), int(height - 10)
                               down_sound.play()
                            elif result == "left":
                               x, y = 10, int(height/2)
                               left_sound.play()
                            elif result == "right":
                               x, y = int(width - 90), int(height/2)                                
                               right_sound.play()
                            elif result == "center":
                               x, y = int(width/2), int(height/2)
                               center_sound.play()
                            flag = result
                        else:
                            cv2.putText(self.frame, result, (x, y), self.font, 2, (0, 0, 255), 3)   
                except:
                    pass
                cv2.imshow("frame", self.frame)
                cv2.imshow("left eye", self.eye_left)
                #cv2.imshow("eye_right", self.eye_right)
            else:
                cv2.imshow("frame", self.frame)
                print("no face detected")
            self.frame_count += 1
            # Wait for a key event
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        # When everything done, release the capture
        self.camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":  
    pass