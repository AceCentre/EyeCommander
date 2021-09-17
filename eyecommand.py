import click
# set parameters


@click.command()
@click.option('--camera', default=0, help='Which camera? A number starting at 0')
@click.option('--confidence', default=0.9, help='Sensitivity of model. Closer to 0 its going to be more fuzzy')
@click.option('--debug', '-d', is_flag=True, flag_value=True, help='Want to log the output?')
@click.option('--outputkeys', '-k', is_flag=True, flag_value=False, help='Presses arrow keys depending which way you look')
@click.option('--outputswitches', '-s', is_flag=True, flag_value=False, help='Presses switch keys in grid3 depending which way you look')
@click.option('--outputvjoy', '-j', is_flag=True, flag_value=False, help='Presses vjoy buttons depending which way you look')
@click.option('--calibrate', '-c', is_flag=True, flag_value=False, help='Do you want it to calibrate first?')
@click.option('--keepdata', is_flag=True, flag_value=False, help='Do you want it to keep your trained data?')
@click.option('--sounds', is_flag=True, flag_value=True, help='Do you want it to speak which direction it thinks you are looking?')
def eyecommand(camera, confidence, debug, outputkeys, outputswitches, outputvjoy, calibrate, keepdata, sounds):
    params = {'camera': camera,
              'confidence': confidence,
              'log_output': debug,
              'output_keys': outputkeys,
              'output_grid3switch': outputswitches,
              'output_vjoyswitch': outputvjoy,
              'calibrate': calibrate,
              'keep_data': keepdata,
              'sounds': sounds}
    from eye_commander.commander import commander
    eyecommander = commander.EyeCommander(**params)
    eyecommander.run()


if __name__ == '__main__':
    eyecommand()
