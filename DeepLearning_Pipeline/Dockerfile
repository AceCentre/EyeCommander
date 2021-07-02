# Start with the Python 3 docker image
# Specifically going to 3/7 due to this issue:  https://github.com/google/mediapipe/issues/1325
FROM python:3.7

# Set the working directory to current directory
WORKDIR /

# Copy the requirements file and install the deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# On startup run the python script
CMD [ "python", "./commander.py" ]