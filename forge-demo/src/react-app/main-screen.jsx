import {
  Button,
  Paper,
  Tooltip,
  Typography,
  tooltipClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { Box } from "@mui/system";
import React, { useCallback, useState } from "react";
import { useResizer } from "./hooks/use-resizer";
import SettingsIcon from "@mui/icons-material/Settings";
import { BlinkDetectionWithSliders } from "./blink-detection-with-sliders.jsx";
import useSound from "use-sound";
import { red } from "@mui/material/colors";
import { useBlinkAction } from "./hooks/use-blink-action";
import { useOpenSettings } from "./hooks/use-open-settings";
import { useReload } from "./hooks/use-reload";
import { useStoreValue } from "./hooks/use-store";
import { PLAY_SOUND } from "./lib/store-consts";

const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 200,
  },
});

export const MainScreen = () => {
  useResizer({ width: 700, height: 750 });
  const reloadTrigger = useReload();
  const [play] = useSound("./public/notif.mp3");
  const [isFaceInFrame, setIsFaceInFrame] = useState(false);
  const sendBlinkToBackend = useBlinkAction();
  const openSettings = useOpenSettings();

  const { value: playSound } = useStoreValue(PLAY_SOUND, true);

  const onBlink = useCallback(() => {
    if (playSound) {
      play();
    }
    sendBlinkToBackend();
  }, [play, playSound, reloadTrigger]);

  if (reloadTrigger % 2 !== 0) {
    return null;
  }

  return (
    <Box sx={{ padding: "2rem" }}>
      <Box
        sx={{
          width: "90%",
          margin: "0 auto",
          marginBottom: "2rem",
          maxWidth: "540px",
        }}
      >
        <CustomWidthTooltip
          title="Change the settings including controlling the output."
          placement="bottom"
          enterDelay={1000}
          enterNextDelay={1000}
        >
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={openSettings}
          >
            Settings
          </Button>
        </CustomWidthTooltip>
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
