import { Slider, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export const SliderWithValue = ({
  label,
  tooltip = "",
  defaultValue = 0,
  onChange = () => {},
  ...props
}) => {
  const id = `slider-label-${label.replace(/\s/g, "-")}`;

  const [currentValue, setCurrentValue] = useState(defaultValue);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Typography id={id}>{label}</Typography>
        {tooltip && (
          <Tooltip placement="top" title={tooltip}>
            <HelpOutlineIcon />
          </Tooltip>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Slider
          onChange={(event) => {
            setCurrentValue(event.target.value);
          }}
          onChangeCommitted={(_, newValue) => {
            onChange(newValue);
          }}
          value={currentValue}
          aria-labelledby={id}
          {...props}
        />
        <Typography>{currentValue}</Typography>
      </Box>
    </Box>
  );
};
