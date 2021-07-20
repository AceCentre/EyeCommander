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
        gray = self._grayscale(image)
        blur = cv2.GaussianBlur(gray, (5,5), cv2.BORDER_DEFAULT)
        segmented_image = self._segment_image(blur)
        resized_image = self._resize(segmented_image)
        return resized_image
    
    def transform(self, images:tuple):
        left, right = images
        left_processed = self._process(left)
        right_processed = self._process(right)
        return (left_processed, right_processed)