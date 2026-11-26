import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import SmoothScrolling from "@/components/SmoothScrolling";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SmoothScrolling />
    <App />
  </StrictMode>,
);
