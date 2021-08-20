import click
#### set parameters


@click.command()
@click.option('--camera', default=0, help='Which camera? A number starting at 0')
@click.option('--confidence', default=0.9, help='Sensitivity of model. Closer to 0 its going to be more fuzzy')
@click.option('--debug/--no-debug', '-d', default=True, help='Want to log the output?')
@click.option('--outputkeys/--no-outputkeys', '-k', default=False, help='Presses arrow keys depending which way you look')
@click.option('--calibrate/--no-calibrate', '-c', default=False, help='Do you want it to calibrate first?')
@click.option('--keepdata/--no-keepdata', default=False, help='Do you want it to keep your trained data?')
@click.option('--sounds/--no-sounds', default=True, help='Do you want it to speak which direction it thinks you are looking?')
def eyecommand(camera, confidence, debug,outputkeys,calibrate,keepdata,sounds):
    params = {'camera': camera, 
          'confidence': confidence, 
          'log_output': debug, 
          'output_keys': outputkeys,
          'calibrate': calibrate,
          'keep_data': keepdata,
          'sounds': sounds}
    print(params)
    from eye_commander.commander import commander
    eyecommander = commander.EyeCommander(**params)
    eyecommander.run()   

if __name__ == '__main__':
    eyecommand()