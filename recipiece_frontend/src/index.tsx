import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

// const registerServiceWorker = async () => {
//   if ("serviceWorker" in navigator) {
//     try {
//       const registration = await navigator.serviceWorker.register(
//         "serviceWorker.js",
//         {
//           scope: "./",
//         }
//       );
//       return registration;
//     } catch (error) {
//       console.error(`Registration failed with ${error}`);
//     }
//   }
// };



// serviceWorker.register();
