import { Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useState } from "react";
import { useResizer } from "./hooks/use-resizer";
import SettingsIcon from "@mui/icons-material/Settings";
import { BlinkDetectionWithSliders } from "./blink-detection-with-sliders.jsx";
import useSound from "use-sound";
import { red } from "@mui/material/colors";
import { useBlinkAction } from "./hooks/use-blink-action";

export const MainScreen = () => {
  useResizer({ width: 800, height: 600 });
  const [play] = useSound("./public/notif.mp3");
  const [isFaceInFrame, setIsFaceInFrame] = useState(false);
  const sendBlinkToBackend = useBlinkAction();

  const onBlink = useCallback(() => {
    play();
    sendBlinkToBackend();
  }, [play]);

  return (
    <Box>
      <Box>
        <Button variant="outlined" startIcon={<SettingsIcon />}>
          Settings
        </Button>
      </Box>
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
        {!isFaceInFrame && (
          <Typography sx={{ color: red[500], fontWeight: "bold" }}>
            No face detected in frame, make sure your face is in the center of
            the screen and well lit.
          </Typography>
        )}
        <BlinkDetectionWithSliders
          onBlink={onBlink}
          faceInFrame={setIsFaceInFrame}
        />
      </Paper>
    </Box>
  );
};
