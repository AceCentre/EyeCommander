/* eslint-disable indent */
import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Button, Paper, Typography } from "@mui/material";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import CodeIcon from "@mui/icons-material/Code";
import Grid4x4Icon from "@mui/icons-material/Grid4x4";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { Box } from "@mui/system";
import { WEB_KEY_TO_OS_KEY } from "../web-key-to-os-key";
import { useStoreValue } from "./hooks/use-store";
import { red } from "@mui/material/colors";

const allIcons = { KeyboardIcon, CodeIcon, Grid4x4Icon, ChatBubbleOutlineIcon };

const getInternals = () => {
  if (!electronInternals) throw new Error("No internals");
  if (!electronInternals.ipcRenderer) throw new Error("No internals");

  return electronInternals.ipcRenderer;
};

export const useOutputOptions = () => {
  const [outputOptions, setOutputOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlySelected, setCurrentlySelected] = useState();

  useEffect(() => {
    const internals = getInternals();

    const getOutputOptions = async () => {
      setLoading(true);
      const outputs = await internals.invoke(
        "outputController",
        "getOutputTypes"
      );
      const selected = await internals.invoke(
        "outputController",
        "getCurrentlySelected"
      );
      setCurrentlySelected(selected);
      setOutputOptions(outputs);
      setLoading(false);
    };

    getOutputOptions();
  }, []);

  const select = (name) => {
    const selected = outputOptions.find((x) => x.name == name);
    setCurrentlySelected(selected);
    const internals = getInternals();

    internals.invoke("outputController", "setCurrentlySelected", selected.name);
  };

  return { outputOptions, loading, currentlySelected, select };
};

const useKeyboardListener = () => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const { value: currentKey, update: updateCurrentKey } = useStoreValue(
    "CURRENT_WEB_KEY",
    " "
  );

  const startListening = () => {
    setIsListening(true);
  };

  const eventHandler = useCallback(
    (event) => {
      setError(null);
      if (isListening) {
        setIsListening(false);

        console.log(event);

        const osKey = WEB_KEY_TO_OS_KEY[event.key.toLowerCase()];

        if (!osKey) {
          setError("The key you entered is not currently supported.");
        } else {
          updateCurrentKey(event.key);
        }
      }
    },
    [isListening]
  );

  useEffect(() => {
    window.addEventListener("keydown", eventHandler);

    return () => window.removeEventListener("keydown", eventHandler);
  }, [eventHandler]);

  return { startListening, key: currentKey || " ", isListening, error };
};

export const KeyboardSettings = () => {
  const { startListening, key, isListening, error } = useKeyboardListener();

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Keyboard
      </Typography>
      <Typography>
        Press the button below then press the key you want to be triggered on a
        blink.
      </Typography>
      <Box>
        <Button
          variant="contained"
          onClick={startListening}
          disabled={isListening}
        >
          {isListening ? "Press key now" : "Listen for keypress"}
        </Button>
      </Box>
      {error && <Typography sx={{ color: red[500] }}>{error}</Typography>}
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
        }}
      >
        <Typography>Currently selected key:</Typography>
        <Box
          sx={{
            padding: "0.5rem 2rem",
            background: "#aaaaaa",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "4px",
          }}
        >
          {key === " " ? "SPACE" : key.toUpperCase()}
        </Box>
      </Box>
    </>
  );
};

export const OutputSettings = ({
  outputOptions,
  loadingOptions,
  currentlySelected,
  select,
}) => {
  if (loadingOptions) return null;

  return (
    <>
      <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        Output options
      </Typography>
      <Box
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {outputOptions.map((output) => (
          <OutputSelectItem
            selected={output.name === currentlySelected.name}
            output={output}
            key={output.name}
            select={select}
          />
        ))}
      </Box>
    </>
  );
};

const OutputSelectItem = ({ output, selected, select }) => {
  const CurrentIcon = allIcons[output.icon];

  const boxStyle = selected
    ? { border: "2px solid #1976d2", padding: "4px", borderRadius: "4px" }
    : {
        border: "2px solid rgba(0,0,0,0)",
        padding: "4px",
        borderRadius: "4px",
      };

  const titleStyle = selected ? { fontWeight: "bold" } : {};

  const avatarStyle = selected ? { backgroundColor: "#1976d2" } : {};

  return (
    <Box sx={{ ...boxStyle }}>
      <Paper
        onClick={() => {
          select(output.name);
        }}
        sx={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          height: "100%",
          cursor: "pointer",
        }}
      >
        <Avatar
          sx={{ margin: "0 auto", width: 60, height: 60, ...avatarStyle }}
          key={output.name}
        >
          <CurrentIcon sx={{ width: 40, height: 40 }} />
        </Avatar>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", fontSize: "1.5rem", ...titleStyle }}
        >
          {output.name}
        </Typography>
        <Typography>{output.description}</Typography>
      </Paper>
    </Box>
  );
};
