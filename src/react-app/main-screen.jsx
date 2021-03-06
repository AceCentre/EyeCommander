import { Button, Tooltip, Typography, tooltipClasses } from "@mui/material";
import { styled } from "@mui/material/styles";

import { Box } from "@mui/system";
import React, { useCallback, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import { BlinkDetectionWithSliders } from "./blink-detection-with-sliders.jsx";
import useSound from "use-sound";
import { red } from "@mui/material/colors";
import { useBlinkAction } from "./hooks/use-blink-action";
import { useOpenSettings } from "./hooks/use-open-settings";
import { useReload } from "./hooks/use-reload";
import { useStoreValue } from "./hooks/use-store";
import { PLAY_SOUND } from "./lib/store-consts";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 200,
  },
});

export const MainScreen = () => {
  const {
    value: playSound,
    reload: reloadPlaySound,
    loading: loadingPlaySound,
  } = useStoreValue(PLAY_SOUND, true);
  const [paused, setPaused] = useState(false);
  const reloadTrigger = useReload([reloadPlaySound]);
  const [play] = useSound("./public/notif.mp3");
  const [isFaceInFrame, setIsFaceInFrame] = useState(true);
  const sendBlinkToBackend = useBlinkAction();
  const openSettings = useOpenSettings();

  const onBlink = useCallback(() => {
    if (playSound && !loadingPlaySound) {
      play();
    }

    if (!paused) {
      sendBlinkToBackend();
    }
  }, [play, playSound, reloadTrigger, paused, loadingPlaySound]);

  if (reloadTrigger % 2 !== 0) {
    return null;
  }

  return (
    <Box sx={{ width: "90%", margin: "0 auto", padding: "1rem 0" }}>
      <BlinkDetectionWithSliders
        onBlink={onBlink}
        faceInFrame={setIsFaceInFrame}
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
        paperSx={{ minHeight: "296px" }}
      >
        <>
          <Box
            sx={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <CustomWidthTooltip
              title="Change the settings including controlling the output."
              placement="bottom"
              enterDelay={1000}
              enterNextDelay={1000}
            >
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={openSettings}
              >
                Settings
              </Button>
            </CustomWidthTooltip>
            {paused ? (
              <CustomWidthTooltip
                title="Continue outputting to the chosen output method"
                placement="bottom"
                enterDelay={1000}
                enterNextDelay={1000}
              >
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => setPaused(false)}
                >
                  Resume
                </Button>
              </CustomWidthTooltip>
            ) : (
              <CustomWidthTooltip
                title="Stop outputting to chosen output method. Will continue to play sound."
                placement="bottom"
                enterDelay={1000}
                enterNextDelay={1000}
              >
                <Button
                  variant="contained"
                  startIcon={<PauseIcon />}
                  onClick={() => setPaused(true)}
                >
                  Pause
                </Button>
              </CustomWidthTooltip>
            )}
          </Box>
        </>
      </BlinkDetectionWithSliders>
      {!isFaceInFrame && (
        <Typography
          sx={{
            color: red[500],
            fontWeight: "bold",
            marginTop: "1rem",
          }}
        >
          No face detected in frame, make sure your full face is in the center
          of the screen and well lit.
        </Typography>
      )}
    </Box>
  );
};
