import click
import ast

# set parameters


@click.command()
@click.option('--camera', default=0, help='Which camera? A number starting at 0')
@click.option('--confidence', default=0.9, help='Sensitivity of model. Closer to 0 its going to be more fuzzy')
@click.option('--debug', '-d', is_flag=True, flag_value=True, help='Want to log the output?')
@click.option('--outputkeys', '-k', is_flag=True, flag_value=False, help='Presses arrow keys depending which way you look')
@click.option('--outputvjoy', '-j', is_flag=True, flag_value=False, help='Presses vjoy buttons depending which way you look')
@click.option('--calibrate', '-c', is_flag=True, flag_value=False, help='Do you want it to calibrate first?')
@click.option('--keepdata', is_flag=True, flag_value=False, help='Do you want it to keep your trained data?')
@click.option('--sounds', is_flag=True, flag_value=True, help='Do you want it to speak which direction it thinks you are looking?')
@click.option('--directions', default='up,down,left,right,center', help='Which directions do you want it to capture?')
@click.option('--datapath',  default='eye_commander/temp', help='Choose where the data directory is stored')
def eyecommand(camera, confidence, debug, outputkeys, outputvjoy, calibrate, keepdata, sounds, directions, datapath):
    # rework params for direction
    directions = ast.literal_eval('["'+directions+'"]')
    directions = [directions.strip() for directions in directions]
    params = {'camera': camera,
              'confidence': confidence,
              'log_output': debug,
              'output_keys': outputkeys,
              'output_vjoyswitch': outputvjoy,
              'calibrate': calibrate,
              'keep_data': keepdata,
              'sounds': sounds,
              'datapath': datapath}
    from eye_commander.commander import commander
    eyecommander = commander.EyeCommander(**params)
    eyecommander.run()


if __name__ == '__main__':
    eyecommand()
