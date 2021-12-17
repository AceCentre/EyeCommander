
var path = require('path');
var spawn = require('child_process').spawn;
var app = require('electron').app;
var logger = require('electron-log')
var regedit = require('regedit').promisified;

var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  logger.info('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};

var check = async function() {
  if (process.platform === 'win32') {
    var cmd = process.argv[1];
    logger.info('processing squirrel command `%s`', cmd);
    var target = path.basename(process.execPath);
    console.log("\n===== MAKING REG EDIT ======")
    const keyPath = 'HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers'
    console.log({ target: process.execPath, keyPath })

    try {
      await regedit.createKey(keyPath);
      await regedit.putValue({[keyPath]: {
        [process.execPath]: {
          value: '~RUNASADMIN',
          type: "REG_SZ"
        }
      }})
      console.log("===== MADE EDIT SUCCESSFULLY =====")
    } catch(error) {
      console.log(error);
      console.log("===== FAILED TO MAKE EDIT =====")

    }

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      run(['--createShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return true;
    }
  }
  return false;
};

module.exports = check();