import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/system";
import { MainScreen } from "./main-screen.jsx";
import { SettingsPage } from "./settings-page.jsx";
import { useLoading } from "./hooks/use-loading.js";

export const Controller = () => {
  const loading = useLoading(2000);

  if (loading) return null;

  if (window && window.IS_SETTINGS_PAGE) {
    return <SettingsPage />;
  }

  return <MainScreen />;
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
