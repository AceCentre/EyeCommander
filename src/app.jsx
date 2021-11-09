import * as React from "react";
import * as ReactDOM from "react-dom";
import { Entry } from "./react-app/index.jsx";

function render() {
  ReactDOM.render(<Entry />, document.getElementById("root"));
}

render();
