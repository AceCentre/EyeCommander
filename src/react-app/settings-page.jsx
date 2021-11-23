/* eslint-disable indent */
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
import { BLINK_MODE, PLAY_SOUND, REVERSE_CAMERA } from "./lib/store-consts";
import { useWebcamSelector } from "./hooks/use-webcam-selector";
import { useSaveAndClose } from "./hooks/use-save-and-close";
import { OutputSettings } from "./output-settings.jsx";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { BLINK_MODES } from "./hooks/use-blink";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";

const SCREENS = {
  CAMERA: "camera",
  OUTPUT: "output",
  SOUND: "sound",
  BLINK: "blink",
  HELP: "help",
  ABOUT: "about",
};

export const SettingsPage = () => {
  useResizer({ width: 910, height: 620 });
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
          <SidebarItem
            selected={currentScreen === SCREENS.HELP}
            icon={<HelpOutlineIcon />}
            onClick={() => setCurrentScreen(SCREENS.HELP)}
          >
            Help
          </SidebarItem>
          <SidebarItem
            selected={currentScreen === SCREENS.ABOUT}
            icon={<InfoIcon />}
            onClick={() => setCurrentScreen(SCREENS.ABOUT)}
          >
            About
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
        {currentScreen === SCREENS.BLINK && <BlinkSettings />}
        {currentScreen === SCREENS.ABOUT && <AboutSettings />}
        {currentScreen === SCREENS.HELP && <HelpSettings />}

        <Box sx={{ alignSelf: "flex-end", marginTop: "auto" }}>
          <Button variant="contained" onClick={saveAndClose}>
            Save and close
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const AboutSettings = () => {
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        About
      </Typography>
      <Typography>
        EyeCommander is an Open Source project developed by AceCentre.
      </Typography>
      <Typography>
        <a href={"https://github.com/acecentre/eyecommander"}>
          Checkout the source code on Github and contribute if you are able.
        </a>
      </Typography>
      <Typography>
        <a href={"https://acecentre.org.uk"}>Visit the Ace Centre website</a> to
        find out more about how we provide support for people with complex
        communications difficulties.
      </Typography>
      <Box sx={{ width: 200, margin: "0 auto" }}>
        <img
          style={{ width: "100%", height: "100%" }}
          src="./public/ace.png"
        ></img>
      </Box>
    </>
  );
};

const HelpSettings = () => {
  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Help
      </Typography>
      <Typography>
        Watch the series of videos below to learn more about how to use
        EyeCommander.
      </Typography>
      <Box sx={{ width: "500px", margin: "0 auto" }}>
        <a href="https://www.youtube.com/watch?v=wIh_UDDYRPg&list=PLWWQ5nlUD_tvVEM9Ch39GuyFAP_zYhAhW">
          <img style={{ width: "100%" }} src="/public/youtube.png"></img>
        </a>
      </Box>
    </>
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

const BlinkSettings = () => {
  const {
    value: blinkMode,
    loading: blinkModeLoading,
    update: blinkModeUpdate,
  } = useStoreValue(BLINK_MODE, BLINK_MODES[0].id);

  if (blinkModeLoading) return null;

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Blink mode
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
        {BLINK_MODES.map((current) => {
          const boxStyle =
            current.id === blinkMode
              ? {
                  border: "2px solid #1976d2",
                  padding: "4px",
                  borderRadius: "4px",
                }
              : {
                  border: "2px solid rgba(0,0,0,0)",
                  padding: "4px",
                  borderRadius: "4px",
                };

          return (
            <Box sx={boxStyle} key={current.id}>
              <Paper
                onClick={() => blinkModeUpdate(current.id)}
                sx={{
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {current.title}
                </Typography>
                <Typography>{current.description}</Typography>
              </Paper>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

const CameraSettings = () => {
  const {
    value: reverse,
    loading: reverseLoading,
    update: reverseUpdate,
  } = useStoreValue(REVERSE_CAMERA, true);

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
