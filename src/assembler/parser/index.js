import as from "arcsecond";

import { labelParser } from "./common.js";
import instructionParser from "./instructions.js";

export default as.many(as.choice([instructionParser, labelParser]));
