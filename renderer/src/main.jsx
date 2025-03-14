import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // 🔄 Change from BrowserRouter
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter> {/* ✅ Use HashRouter instead */}
      <App />
    </HashRouter>
  </StrictMode>
);

