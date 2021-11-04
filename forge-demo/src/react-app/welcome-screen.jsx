import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Webcam from "react-webcam";
import Avatar from "@mui/material/Avatar";
import CheckIcon from "@mui/icons-material/Check";
import { green, red } from "@mui/material/colors";
import { useWebcamSelector } from "./hooks/use-webcam-selector";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Button, Paper } from "@mui/material";
import { SelectedWebcam } from "./selected-webcam.jsx";
import { FaceFramer } from "./face-framer.jsx";
import { BlinkTraining } from "./blink-training.jsx";
import { useResizer } from "./hooks/use-resizer";

const getTaskProps = (taskNumber, current) => ({
  completed: current > taskNumber,
  active: current == taskNumber,
});

export const WelcomeScreen = () => {
  const [activeTask, setActiveTask] = useState(1);

  useResizer({ width: 700, height: 1255 });

  return (
    <>
      <Typography variant="h1" sx={{ textAlign: "center", fontSize: "3rem" }}>
        Welcome to{" "}
        <Box component="span" sx={{ textDecoration: "underline" }}>
          EyeCommander
        </Box>
      </Typography>
      <Typography variant="subtitle1" sx={{ textAlign: "center" }}>
        To get setup complete the list of tasks below.
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "90%",
          maxWidth: "540px",
          margin: "2rem auto",
        }}
      >
        <Typography variant="h2" sx={{ fontSize: "1.5rem" }}>
          Task list
        </Typography>
        <Task {...getTaskProps(1, activeTask)}>Pick your webcam device.</Task>
        <Task {...getTaskProps(2, activeTask)}>
          Make sure your face is in frame
        </Task>
        <Task {...getTaskProps(3, activeTask)}>Setup blink sensitivity</Task>
      </Box>

      <TaskController
        activeTask={activeTask}
        nextTask={() => setActiveTask((current) => current + 1)}
        prevTask={() => setActiveTask((current) => current - 1)}
      />
    </>
  );
};

const WebcamDeviceSelector = ({ nextTask }) => {
  const { devices, loading, setDeviceId, selectedDeviceId } =
    useWebcamSelector();

  if (loading) return null;

  if (!devices || devices.length === 0) {
    return (
      <Box sx={{ width: "90%", maxWidth: "540px", margin: "0 auto" }}>
        <Typography
          sx={{ color: red[500], fontWeight: "bold", textAlign: "center" }}
        >
          You have no camera devices connected to your computer. Connect a
          camera device and then restart EyeCommander
        </Typography>
      </Box>
    );
  }

  const handleChange = (event) => {
    setDeviceId(event.target.value);
  };

  return (
    <Paper
      sx={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "90%",
        margin: "0 auto",
        maxWidth: "540px",
      }}
    >
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
      <Webcam videoConstraints={{ deviceId: selectedDeviceId }} />
      <Box sx={{ textAlign: "right" }}>
        <Button size="large" variant="contained" onClick={nextTask}>
          Next step
        </Button>
      </Box>
    </Paper>
  );
};

const TaskController = ({ activeTask, nextTask, prevTask }) => {
  if (activeTask === 1) {
    return <WebcamDeviceSelector nextTask={nextTask} />;
  }

  if (activeTask == 2) {
    return <FaceFramer nextTask={nextTask} prevTask={prevTask} />;
  }

  if (activeTask == 3) {
    return <BlinkTraining nextTask={nextTask} prevTask={prevTask} />;
  }

  throw new Error(`No task: ${activeTask}`);
};

const Task = ({ children, completed, active = false }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {completed ? (
        <Avatar sx={{ bgcolor: green[500] }}>
          <CheckIcon />
        </Avatar>
      ) : (
        <Avatar
          sx={{ backgroundColor: "transparent", border: "2px solid #bdbdbd" }}
        >
          <CheckIcon sx={{ display: "none" }} />
        </Avatar>
      )}
      <Typography sx={{ fontWeight: active ? "bold" : "none" }}>
        {children}
      </Typography>
    </Box>
  );
};
