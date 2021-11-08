import React from "react";
import { useStoreValue } from "./hooks/use-store.js";
import { INITIAL_SETUP_REQUIRED } from "./lib/store-consts.js";
import { WelcomeScreen } from "./welcome-screen.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/system";
import { MainScreen } from "./main-screen.jsx";
import { SettingsPage } from "./settings-page.jsx";
import { useLoading } from "./hooks/use-loading.js";

export const Controller = () => {
  const {
    loading: loadingSetupRequired,
    value: initialSetupRequired,
    reload: reloadInitialSetup,
  } = useStoreValue(INITIAL_SETUP_REQUIRED, true);
  const loading = useLoading(2000);

  console.log({ window, isSettings: window.IS_SETTINGS_PAGE, loading });

  if (loading) return null;

  if (window && window.IS_SETTINGS_PAGE) {
    return <SettingsPage />;
  }

  if (loadingSetupRequired) return null;

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
        }}
      >
        <Controller />
      </Box>
    </>
  );
};
