import { Button, Paper, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import { Box } from "@mui/system";
import React, { useCallback, useState } from "react";

import { CameraWithHighlights } from "./camera-with-highlights.jsx";

export const FaceFramer = ({ nextTask, prevTask }) => {
  const [allowNext, setAllowNext] = useState(true);

  const onFrame = useCallback(
    (results) => {
      if (results.multiFaceLandmarks.length === 1) {
        setAllowNext(true);
      } else {
        setAllowNext(false);
      }
    },
    [setAllowNext]
  );

  return (
    <Box
      sx={{
        width: "95%",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
      }}
    >
      <CameraWithHighlights onFrame={onFrame} />

      <Paper
        sx={{
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
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
            <Typography sx={{ color: green[500], fontWeight: "bold" }}>
              We found your face in the frame. Click &apos;Next step&apos; below
              to continue
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <Button onClick={prevTask} size="large">
            Previous step
          </Button>
          <Button
            onClick={nextTask}
            disabled={!allowNext}
            size="large"
            variant="contained"
          >
            Next step
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
