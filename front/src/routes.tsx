import { createBrowserRouter, Link } from "react-router-dom";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "highway",
    element: <App />,
  },
  {
    path: "election",
    element: (
      <div>
        <h1>Hello World</h1>
        <Link to="about">About Us</Link>
      </div>
    ),
  },
]);

export default router;
