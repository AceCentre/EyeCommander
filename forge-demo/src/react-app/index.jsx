import React from "react";
import { FaceMeshBlinking } from "./face-mesh-blinking.jsx";
import { useStoreValue } from "./hooks/use-store.js";
import { INITIAL_SETUP_REQUIRED } from "./lib/store-consts.js";
import { WelcomeScreen } from "./welcome-screen.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/system";
import { MainScreen } from "./main-screen.jsx";

const { ipcRenderer, store } = electronInternals;

export const Controller = () => {
  const {
    loading,
    value: initialSetupRequired,
    reload: reloadInitialSetup,
  } = useStoreValue(INITIAL_SETUP_REQUIRED, true);

  if (loading) return null;

  if (initialSetupRequired) {
    return <WelcomeScreen forceReload={reloadInitialSetup} />;
  }

  if (!initialSetupRequired) {
    return <MainScreen />;
  }

  return null;
};

export const Entry = () => {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          height: "100%",
          width: "100%",
          minHeight: "100vh",
          minWidth: "100vw",
          background: "rgb(234, 238, 243)",
          padding: "2rem",
        }}
      >
        <Controller />
      </Box>
    </>
  );
};
