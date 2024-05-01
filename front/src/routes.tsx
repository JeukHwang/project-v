import { createBrowserRouter } from "react-router-dom";
import Election from "./components/page/Election";

const router = createBrowserRouter([
  {
    path: "election",
    element: <Election />,
  },
]);

export default router;
