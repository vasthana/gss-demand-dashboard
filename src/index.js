// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./css/global.css"; // use global CSS from css folder

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
