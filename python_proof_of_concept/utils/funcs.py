import sys
import os

# Calculate the path to a resource.
# If we are running in pyinstaller then the _MEIPASS env variable
# is set so we set the path to that path
# If its not set we assume you are just running it in normal python so use the
# relative path to the resources
# https://stackoverflow.com/questions/56210408/location-of-the-added-files-after-the-executable-file-is-generated-by-pyinstalle
def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path.replace("/", "\\"))

    return os.path.join(os.getcwd(), relative_path)