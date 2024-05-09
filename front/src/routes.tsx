import { createBrowserRouter } from "react-router-dom";
import Election from "./components/page/Election";
import Highway from "./components/page/Highway";

const router = createBrowserRouter([
  {
    path: "election",
    element: <Election />,
  },
  {
    path: "highway",
    element: <Highway />,
  },
]);

export default router;
