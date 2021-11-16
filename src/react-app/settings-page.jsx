import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { useResizer } from "./hooks/use-resizer";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import LogoutIcon from "@mui/icons-material/Logout";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useStoreValue } from "./hooks/use-store";
import { PLAY_SOUND, REVERSE_CAMERA } from "./lib/store-consts";
import { useWebcamSelector } from "./hooks/use-webcam-selector";
import { useSaveAndClose } from "./hooks/use-save-and-close";
import { OutputSettings } from "./output-settings.jsx";
import VisibilityIcon from "@mui/icons-material/Visibility";

const SCREENS = {
  CAMERA: "camera",
  OUTPUT: "output",
  SOUND: "sound",
  BLINK: "blink",
};

export const SettingsPage = () => {
  useResizer({ width: 600, height: 600 });
  const saveAndClose = useSaveAndClose();
  const [currentScreen, setCurrentScreen] = useState(SCREENS.CAMERA);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 3fr",
      }}
    >
      <Paper sx={{ width: "100%", height: "100%" }}>
        <List>
          <SidebarItem
            selected={currentScreen === SCREENS.CAMERA}
            icon={<VideoCameraFrontIcon />}
            onClick={() => setCurrentScreen(SCREENS.CAMERA)}
          >
            Camera
          </SidebarItem>
          <SidebarItem
            selected={currentScreen === SCREENS.OUTPUT}
            icon={<LogoutIcon />}
            onClick={() => setCurrentScreen(SCREENS.OUTPUT)}
          >
            Output
          </SidebarItem>
          <SidebarItem
            selected={currentScreen === SCREENS.SOUND}
            icon={<VolumeUpIcon />}
            onClick={() => setCurrentScreen(SCREENS.SOUND)}
          >
            Sound
          </SidebarItem>
          <SidebarItem
            selected={currentScreen === SCREENS.BLINK}
            icon={<VisibilityIcon />}
            onClick={() => setCurrentScreen(SCREENS.BLINK)}
          >
            Blink
          </SidebarItem>
        </List>
      </Paper>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {currentScreen === SCREENS.CAMERA && <CameraSettings />}
        {currentScreen === SCREENS.OUTPUT && <OutputSettings />}
        {currentScreen === SCREENS.SOUND && <SoundSettings />}

        <Box sx={{ alignSelf: "flex-end", marginTop: "auto" }}>
          <Button variant="contained" onClick={saveAndClose}>
            Save and close
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const SoundSettings = () => {
  const {
    value: playSound,
    loading: playSoundLoading,
    update: playSoundUpdate,
  } = useStoreValue(PLAY_SOUND, true);

  if (playSoundLoading) return null;

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Sound options
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={playSound}
            onChange={(event) => playSoundUpdate(event.target.checked)}
          />
        }
        label="Play sound on blink"
      />
    </>
  );
};

const CameraSettings = () => {
  const {
    value: reverse,
    loading: reverseLoading,
    update: reverseUpdate,
  } = useStoreValue(REVERSE_CAMERA, false);

  const {
    devices,
    loading: devicesLoading,
    setDeviceId,
    selectedDeviceId,
  } = useWebcamSelector();

  const handleChange = (event) => {
    setDeviceId(event.target.value);
  };

  if (reverseLoading || devicesLoading) return null;

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Camera options
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={reverse}
            onChange={(event) => reverseUpdate(event.target.checked)}
          />
        }
        label="Reverse camera"
      />
      <FormControl>
        <InputLabel>Input device</InputLabel>
        <Select
          defaultValue={selectedDeviceId}
          label="Input device"
          onChange={handleChange}
        >
          {devices.map((device) => (
            <MenuItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

const SidebarItem = ({ children, icon, selected, onClick }) => {
  return (
    <ListItemButton selected={selected} onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{children}</ListItemText>
    </ListItemButton>
  );
};
