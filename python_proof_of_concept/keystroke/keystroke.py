from pynput.keyboard import Key, Controller

def output_keystrokes(label:str):
        """_output_keystrokes works just like _display_prediction only it outputs keystrokes for each class prediction
        instead of text.
        Args:
            label (str): predicted label
        """
        keyboard = Controller()
        
        if label == 'left':
            
            keyboard.press(Key.left)
            keyboard.release(Key.left)
                
        elif label == 'right':
            
            keyboard.press(Key.right)
            keyboard.release(Key.right)
            
        elif label == 'up':
            
            keyboard.press(Key.up)
            keyboard.release(Key.up)
            
        elif label == 'down':
            
            keyboard.press(Key.down)
            keyboard.release(Key.down)
        