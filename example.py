from eye_commander.commander import commander

#### set parameters

params = {'camera': 0, 
          'confidence': 0.9, 
          'log_output': False, 
          'output_keys': True,
          'output_grid3switch': False,
          'calibrate': False,
          'keep_data': False,
          'sounds': True,
          'directions':['left','right','up','down','center']}

eyecommander = commander.EyeCommander(**params)

eyecommander.run()   

