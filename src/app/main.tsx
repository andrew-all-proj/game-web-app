import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "../routes";
import InitTelegram from "./InitTelegram";

const AppRouter = () => useRoutes(routes);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <InitTelegram />
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);