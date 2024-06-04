import { createBrowserRouter } from "react-router-dom";
import Election from "./components/page/Election";
import Highway from "./components/page/Highway";
import HighwayLegacy from "./components/page/HighwayLegacy";

const router = createBrowserRouter([
  {
    path: "election",
    element: <Election />,
  },
  {
    path: "highway",
    element: <Highway />,
  },
  {
    path: "highway-legacy",
    element: <HighwayLegacy />,
  },
]);

export default router;
