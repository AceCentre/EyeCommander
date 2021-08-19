# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

def get_mediapipe_path():
    import mediapipe
    mediapipe_path = mediapipe.__path__[0]
    return mediapipe_path

added_files = [
    ( './eye_commander/models/trained_models', './eye_commander/models/trained_models' ),
]

a = Analysis(['eyecommand.py'],
             pathex=['.'],
             binaries=[],
             datas=added_files,
             hiddenimports=["skimage.filters.rank.core_cy_3d","pynput.keyboard._win32", "pynput.mouse._win32"],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=True)
             
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)

mediapipe_tree = Tree(get_mediapipe_path(), prefix='mediapipe', excludes=["*.pyc"])
a.datas += mediapipe_tree
a.binaries = filter(lambda x: 'mediapipe' not in x[0], a.binaries)

exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [('v', None, 'OPTION')],
          name='EyeCommander',
          debug=True,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          upx_exclude=[],
          runtime_tmpdir=None,
          console=True )
