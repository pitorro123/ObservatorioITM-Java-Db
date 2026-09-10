import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { EventosProvider } from "./context/EventosContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ContenidoProvider } from "./context/ContenidoContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EventosProvider>
          <ContenidoProvider>
            <App />
          </ContenidoProvider>
        </EventosProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);