import * as React from "react";
import * as ReactDOM from "react-dom";
import { Entry } from "./react-app/index.jsx";

function render() {
  ReactDOM.render(<Entry />, document.getElementById("root"));
}

render();

window.addEventListener("click", function (event) {
  event.preventDefault();

  if (event.target.tagName === "A") {
    event.preventDefault();
    electronInternals.openExternal(event.target.href);
  }

  if (event.target.parentElement.tagName === "A") {
    event.preventDefault();
    electronInternals.openExternal(event.target.parentElement.href);
  }
});
