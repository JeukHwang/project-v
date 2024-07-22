// import { build } from "./node/build";

import { build } from "vite";

/** Command : pnpm execute > ../data/highway/icjc_vN.json */
function buildPlaceNodes() {
  console.log(JSON.stringify(build(), null, 2));
}

// buildPlaceNodes();
