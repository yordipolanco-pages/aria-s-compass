import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./contexts/UserContext";
import App from "./App.tsx";
import "./index.css";

// TODO: Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "66817601602-2244q405acln9a7veht81osv8mmoaiqf.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <UserProvider>
            <App />
        </UserProvider>
    </GoogleOAuthProvider>
);
