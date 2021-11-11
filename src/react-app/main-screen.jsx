import { Button, Tooltip, Typography, tooltipClasses } from "@mui/material";
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
  useResizer({ width: 900, height: 440 });
  const { value: playSound, reload: reloadPlaySound } = useStoreValue(
    PLAY_SOUND,
    true
  );
  const reloadTrigger = useReload([reloadPlaySound]);
  const [play] = useSound("./public/notif.mp3");
  const [isFaceInFrame, setIsFaceInFrame] = useState(true);
  const sendBlinkToBackend = useBlinkAction();
  const openSettings = useOpenSettings();

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
    <Box sx={{ width: "90%", margin: "0 auto", padding: "1rem 0" }}>
      <BlinkDetectionWithSliders
        onBlink={onBlink}
        faceInFrame={setIsFaceInFrame}
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
        paperSx={{ minHeight: "296px" }}
      >
        <>
          {!isFaceInFrame && (
            <Typography sx={{ color: red[500], fontWeight: "bold" }}>
              No face detected in frame, make sure your face is in the center of
              the screen and well lit.
            </Typography>
          )}
          <Box sx={{ marginTop: "auto" }}>
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
        </>
      </BlinkDetectionWithSliders>
    </Box>
  );
};
