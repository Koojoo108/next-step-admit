import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[Main] Script execution started");

// Global error handling for easier debugging
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[Global Error]", { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  console.error("[Unhandled Promise Rejection]", event.reason);
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("[Main] Root element not found!");
} else {
  try {
    console.log("[Main] Creating root...");
    const root = createRoot(rootElement);
    console.log("[Main] Rendering App...");
    root.render(<App />);
    console.log("[Main] App render call completed");
  } catch (error) {
    console.error("[Main] Rendering error:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h1>Application Error</h1>
        <p>A critical error occurred while starting the application.</p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}
