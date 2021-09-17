from eye_commander.commander import commander

# set parameters

params = {'camera': 0,
          'confidence': 0.9,
          'log_output': False,
          'output_keys': True,
          'output_vjoyswitch': False,
          'calibrate': False,
          'keep_data': True,
          'sounds': True,
          'directions': ['up']}

eyecommander = commander.EyeCommander(**params)

eyecommander.run()
