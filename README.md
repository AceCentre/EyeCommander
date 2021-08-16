# EyeCommander
### An open source computer vision interface that tracks eye movements for individuals with severely-limited mobility. 

#### This is a project started by Lucas Henrique, Daniel Kashkett, and Giovanbattista Amato for AceCentre as part of the 2021 Chronic Coders Coding Academy. The EyeCommander is designed as an open-source solution to eye-gesture detection that will work without the need for a fancy camera or expensive software.

#### There are two pipelines in this project the first is a OpenCV pipeline. This works  but it can be a bit unreliable with glasses and low light levels. The other is a ML approach. We currently have a Tensorflow ML approach documented here. Initally we are building this up as a docker image and some scripts to validate this more in the field. 

##How to Use

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
  --camera INTEGER    Which camera? A number starting at 0
  --confidence FLOAT  Sensitivity of model. Closer to 0 its going to be more
                      fuzzy

  -d, --debug         Want to log the output?
  -k, --outputkeys    Presses arrow keys depending which way you look
  -c, --calibrate     Do you want it to calibrate first?
  --keepdata          Do you want it to keep your trained data?
  --sounds            Do you want it to speak which direction it thinks you
                      are looking?

  --help              Show this message and exit.
```

## Licence

[GNU GPL v3](LICENCE.txt)


