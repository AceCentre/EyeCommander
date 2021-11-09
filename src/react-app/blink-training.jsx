import { Avatar, Button, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useCallback, useState } from "react";
import { green, red } from "@mui/material/colors";
import { useSound } from "use-sound";

import { useStoreValue } from "./hooks/use-store.js";
import { INITIAL_SETUP_REQUIRED } from "./lib/store-consts.js";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { BlinkDetectionWithSliders } from "./blink-detection-with-sliders.jsx";

const getColorProp = (blinkCount, iconNumber) => {
  if (blinkCount >= iconNumber) {
    return { backgroundColor: green[500] };
  }
  return {};
};

export const BlinkTraining = ({ prevTask, forceReload }) => {
  const { update: updateInitialSetup } = useStoreValue(
    INITIAL_SETUP_REQUIRED,
    true
  );
  const [blinkCount, setBlinkCount] = useState(0);

  const [allowNext, setAllowNext] = useState(true);
  const [play] = useSound("./public/notif.mp3");

  const onBlink = useCallback(() => {
    setBlinkCount((x) => x + 1);
    play();
  }, [setBlinkCount, play]);

  return (
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
      {!allowNext ? (
        <Box>
          <Typography sx={{ color: red[500] }}>
            We cannot find a face in the window. Try getting closer to the
            webcam or improve the lighting of your face.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography>
            Adjust the sliders below to make sure it can reliably detect your
            blink. There will be a sound played every time a blink is detected.
          </Typography>
        </Box>
      )}
      <Box>
        <Typography>
          To finish setup you must register at least 4 blinks.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            margin: "1rem 0",
          }}
        >
          <Avatar
            sx={{ width: 56, height: 56, ...getColorProp(blinkCount, 1) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
          <Avatar
            sx={{ width: 56, height: 56, ...getColorProp(blinkCount, 2) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
          <Avatar
            sx={{ width: 56, height: 50, ...getColorProp(blinkCount, 3) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
          <Avatar
            sx={{ width: 56, height: 56, ...getColorProp(blinkCount, 4) }}
          >
            <VisibilityIcon sx={{ width: 40, height: 40 }} />
          </Avatar>
        </Box>
      </Box>
      <BlinkDetectionWithSliders faceInFrame={setAllowNext} onBlink={onBlink} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={prevTask} size="large">
          Previous step
        </Button>
        <Button
          onClick={() => {
            updateInitialSetup(false);
            forceReload();
          }}
          disabled={!allowNext || blinkCount < 4}
          size="large"
          variant="contained"
        >
          Finish setup
        </Button>
      </Box>
    </Paper>
  );
};
