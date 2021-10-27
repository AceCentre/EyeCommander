import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import Typography from "@material-ui/core/Typography";
import electron from "electron";
import { OutputCameraDemo } from "../components/OutputCameraDemo";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      textAlign: "center",
      paddingTop: theme.spacing(4),
    },
  })
);

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const classes = useStyles({});

  const onClickWithIpcSync = (key) => () => {
    ipcRenderer.send("trigger-keypress", key);
  };

  const triggerKeypressSuccess = (event, data) => {
    console.log("trigger success", data);
  };

  useEffect(() => {
    ipcRenderer.on("trigger-keypress-success", triggerKeypressSuccess);

    return () => {
      ipcRenderer.removeAllListeners("trigger-keypress-success");
    };
  }, []);

  return (
    <>
      <Head>
        <title>Eye Commander</title>
      </Head>
      <div className={classes.root}>
        <OutputCameraDemo />
        <Typography variant="h4" gutterBottom>
          Material-UI
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          with Nextron
        </Typography>
        <img src="/images/logo.png" />
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClickWithIpcSync("up")}
          >
            Send 'up' keypress
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClickWithIpcSync("down")}
          >
            Send 'down' keypress
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClickWithIpcSync("left")}
          >
            Send 'left' keypress
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClickWithIpcSync("right")}
          >
            Send 'right' keypress
          </Button>
        </div>
      </div>
    </>
  );
}

export default Home;
