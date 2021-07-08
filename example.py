from eye_commander.commander import commander

cmder = commander.EyeCommander()
cmder.run(calibrate=False)   

# exp = commander.Exp()
# exp.auto_calibrate()
# model = exp._load_model_for_retrain()
# retrained_model = exp._retrain(model)
# print('retrain complete')