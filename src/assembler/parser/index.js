import as from "arcsecond";

import { labelParser } from "./common.js";
import { data8Parser, data16Parser } from "./data.js";
import { constantParser } from "./constant.js";
import instructionParser from "./instructions.js";

export default as.many(
  as.choice([data8Parser, data16Parser, constantParser, instructionParser, labelParser])
);
