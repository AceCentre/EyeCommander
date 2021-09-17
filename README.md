# EyeCommander
### An open source computer vision interface that tracks eye movements for individuals with severely-limited mobility. 

![Logo](/misc/logo.png)
![Screenshot](/misc/screenshot.png)

#### This is a project started by Lucas Henrique, Daniel Kashkett, and Giovanbattista Amato for AceCentre as part of the 2021 Chronic Coders Coding Academy. The EyeCommander is designed as an open-source solution to eye-gesture detection that will work without the need for a fancy camera or expensive software.

#### There are two pipelines in this project the first is a OpenCV pipeline. This works  but it can be a bit unreliable with glasses and low light levels. The other is a ML approach. We currently have a Tensorflow ML approach documented here. Initally we are building this up as a docker image and some scripts to validate this more in the field. 

## How to Use

```python
git clone https://github.com/AceCentre/EyeCommander.git
cd eye_commander
pip install -r requirements.txt
python example.py
```

All options can be found in `example.py`

If you want a command line version is available at `eyecommand.py`

You can download a built binary for Windows [here](https://github.com/AceCentre/EyeCommander/releases/latest) (download the exe)

These are the options:

```
Usage: eyecommand.py [OPTIONS]

Options:
  --camera INTEGER                Which camera? A number starting at 0
  --confidence FLOAT              Sensitivity of model. Closer to 0 its going
                                  to be more fuzzy

  --debug / --no-debug            Want to log the output?
  --outputkeys / --no-outputkeys  Presses arrow keys depending which way you
                                  look

  --calibrate / --no-calibrate    Do you want it to calibrate first?
  --keepdata / --no-keepdata      Do you want it to keep your trained data?
  --sounds / --no-sounds          Do you want it to speak which direction it
                                  thinks you are looking?

  --help                          Show this message and exit.

```

## To re-train the base model

Info here.. 

## To share your data directory with the developers

1. Read and consent to sharing your data with us. 
2. Submit the contents of your ``filepath-here`` with us at adsada@adsad.com

# Operating System specific guides

## Windows
### Install/Run notes

- You might get an error like ``Could not find the DLL(s) 'msvcp140_1.dll'``. If so  go to https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads and download ``x64: vc_redist.x64.exe`` and install that. Then try again.
- If you want to run a batch script to run the python version this might help:

```
@echo off
"C:\Users\Ron\AppData\Local\Programs\Python\Python39\python.exe" "C:\EyeCommander\eyecommand.py"
pause
```

### To build an executable 

```
cd EyeCommander
pip install -r eye_commander/requirements.txt 
pip install pyinstaller
pyinstaller installer.spec --onedir --console --name EyeCommander
```

### To build an installer

(NB: Windows Only)

- Follow instructions to build an executable above.
- Install [NSIS](https://nsis.sourceforge.io/Download)
- ``cd build_scripts``
- ``makensis build_installer.nsi``

## Licence

[GNU GPL v3](LICENCE.txt)


