/* eslint-disable indent */
import React, { useEffect, useState } from "react";
import { Avatar, Paper, Typography } from "@mui/material";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import CodeIcon from "@mui/icons-material/Code";
import Grid4x4Icon from "@mui/icons-material/Grid4x4";

import { Box } from "@mui/system";

const allIcons = { KeyboardIcon, CodeIcon, Grid4x4Icon };

const getInternals = () => {
  if (!electronInternals) throw new Error("No internals");
  if (!electronInternals.ipcRenderer) throw new Error("No internals");

  return electronInternals.ipcRenderer;
};

const useOutputOptions = () => {
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

export const OutputSettings = () => {
  const {
    outputOptions,
    loading: loadingOptions,
    currentlySelected,
    select,
  } = useOutputOptions();

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
