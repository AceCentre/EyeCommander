from sys import platform
import time
if platform == "win32":
    import pyvjoy

"""
Sends switch presses on Grid3 via vJoy. Only possible on Windows and using Grid3. 

"""


def Switch_Press(id):
    if platform == "win32":
        j = pyvjoy.VJoyDevice(1)
        j.set_button(id, 1)
    else:
        return None


def Switch_Release(id):
    if platform == "win32":
        j = pyvjoy.VJoyDevice(1)
        j.set_button(id, 0)
    else:
        return None


def Switch_Press_Release(id):
    if platform == "win32":
        j = pyvjoy.VJoyDevice(1)
        j.set_button(id, 1)
        # Needs some time period here
        time.sleep(0.005)
        j.set_button(id, 0)
    else:
        return None
