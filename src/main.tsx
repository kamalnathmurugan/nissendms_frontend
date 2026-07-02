import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import "./index.css";
import App from "./App";
import { msalInstance } from "./authConfig";

// Handle the /auth-callback route: MSAL needs the app to render here
// so it can process the redirect response (code → token exchange).
// After MSAL finishes handleRedirectPromise, it will navigate back to "/".
msalInstance.initialize().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  );
});
