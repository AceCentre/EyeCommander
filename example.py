from eye_commander.commander import commander

#### set parameters

params = {'camera': 0, 
          'confidence': 0.9, 
          'log_output': False, 
          'output_keys': True,
          'calibrate': False,
          'keep_data': False}

eyecommander = commander.EyeCommander(**params)

eyecommander.run()   

