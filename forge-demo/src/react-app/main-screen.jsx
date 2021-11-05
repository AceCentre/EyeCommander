import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { CameraWithHighlights } from "./camera-with-highlights.jsx";
import { useResizer } from "./hooks/use-resizer";

export const MainScreen = () => {
  useResizer({ width: 800, height: 600 });

  return (
    <Box>
      <Paper>
        <CameraWithHighlights />
      </Paper>
    </Box>
  );
};
