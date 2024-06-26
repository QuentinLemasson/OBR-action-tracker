import React from "react";
import ReactDOM from "react-dom/client";
import ThemeProvider from "@mui/material/styles/ThemeProvider";

import { App } from "./App";
import "./index.css";
import { PluginGate } from "./components/PluginGate";
import { PluginThemeProvider } from "./components/PluginThemeProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PluginGate>
      <PluginThemeProvider>
        <App />
      </PluginThemeProvider>
    </PluginGate>
  </React.StrictMode>
);