import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Election from "./Election";

const router = createBrowserRouter([
  {
    path: "highway",
    element: <App />,
  },
  {
    path: "election",
    element: <Election />,
  },
]);

export default router;
