import cv2
import numpy as np
from skimage import filters

class ImageProcessor:
    
    def __init__(self):
        self.raw = None
        self.output_size = (63,35)

    def _grayscale(self,image:np.array):
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    def _segment_image(self, gray_image:np.array, block_size:int=63, offset:int=15):
        local_thresh = filters.threshold_local(gray_image, block_size=block_size, offset=offset)
        binary_local = gray_image > local_thresh
        binary_local = binary_local.astype(np.uint8)  
        binary_local*=255
        return binary_local
    
    def _resize(self, image:np.array):
        resized = cv2.resize(src=image, dsize=self.output_size)
        return resized
    
    def _process(self, image):
        # denoising
        denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 15, 0)
        # convert to grayscale
        grayscale = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
        # add blur
        blur = cv2.GaussianBlur(grayscale, (5,5), cv2.BORDER_DEFAULT)
        # segment using local threshold
        segmented = self._segment_image(blur)
        # resize image
        resized = self._resize(segmented)
        return resized
    
    def transform(self, images:tuple):
        left, right = images
        left_processed = self._process(left)
        right_processed = self._process(right)
        return (left_processed, right_processed)
    
class FeatureExtractor:
    def __init__(self):
        self.extractor = self.build_feature_extractor()
    
    def build_feature_extractor(self):
        mobile = tf.keras.applications.mobilenet_v2.MobileNetV2(include_top=False,weights='imagenet',input_shape=(50,80,3))
        for layer in mobile.layers:
            layer.trainable = False
        input_layer = tf.keras.Input(shape=(50, 80, 3))
        preprocess_layer = tf.keras.layers.experimental.preprocessing.Rescaling(1./255)(input_layer)
        mobilenet = mobile(preprocess_layer)
        features = tf.keras.layers.GlobalAveragePooling2D()(mobilenet)
        feature_extractor = tf.keras.Model(inputs=input_layer, outputs=features)
        return feature_extractor
    
    def extract(self, input_):
        features = self.extractor.predict(input_)
        return features
