import { inspect } from "node:util";

import instructionsParser from "./instructions.js";

let deepLog = (x) =>
  console.log(
    inspect(x, {
      depth: Infinity,
      colors: true,
    })
  );

let state = instructionsParser.run("hlt");

deepLog(state);
