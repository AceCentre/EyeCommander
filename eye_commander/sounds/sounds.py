import os
import simpleaudio as sa
from playsound import playsound
import pygame 
pygame.init()
pygame.mixer.init()

PATH = os.path.join(os.getcwd(),'eye_commander/sounds/sound_files')
UP       = sa.WaveObject.from_wave_file(os.path.join(PATH, 'up.wav'))
DOWN     = sa.WaveObject.from_wave_file(os.path.join(PATH, 'down.wav'))
LEFT     = sa.WaveObject.from_wave_file(os.path.join(PATH, 'left.wav'))
RIGHT     = sa.WaveObject.from_wave_file(os.path.join(PATH, 'right.wav'))
KEEP     = sa.WaveObject.from_wave_file(os.path.join(PATH, 'keep.wav'))

def play(label:str):
    if label == 'up':
        pygame.mixer.music.load(os.path.join(PATH, 'up.wav'))
        pygame.mixer.music.play()
    elif label == 'down':
  
        pygame.mixer.music.load(os.path.join(PATH, 'down.wav'))
        pygame.mixer.music.play()
        
    elif label == 'right':
  
        pygame.mixer.music.load(os.path.join(PATH, 'right.wav'))
        pygame.mixer.music.play()
    elif label == 'left':
        
        pygame.mixer.music.load(os.path.join(PATH, 'left.wav'))
        pygame.mixer.music.play()
        

