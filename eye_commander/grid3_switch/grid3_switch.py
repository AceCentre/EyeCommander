from sys import platform
if platform == "win32":
    from win32 import win32gui
    import win32ui
    import win32con
    import win32api

"""
Sends switch presses on Grid3. Only possible on Windows and using Grid3. 

Switch_Press(1)
Switch_Release(1)

Switch_Press_Release(2)
Switch_Press_Release(3)
"""

if platform == "win32":
    _wmSensorySwitchInput = win32gui.RegisterWindowMessage(
        "Sensory_SwitchInput")


def SetSwitchSate(id, state):
    win32gui.SendMessage(win32con.HWND_BROADCAST,
                         _wmSensorySwitchInput, id, state)


def Switch_Press(id):
    if platform == "win32":
        SetSwitchSate(id, 0)
    else:
        return None


def Switch_Release(id):
    if platform == "win32":
        SetSwitchSate(id, 1)
    else:
        return None


def Switch_Press_Release(id):
    if platform == "win32":
        SetSwitchSate(id, 0)
        SetSwitchSate(id, 1)
    else:
        return None


# args = sys.argv[1:]
# id = args[0]
# state = args[1]
Switch_Press_Release(1)
