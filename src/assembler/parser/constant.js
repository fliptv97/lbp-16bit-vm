import as from "arcsecond";

import { validIdentifierParser, hexLiteralParser } from "./common.js";
import * as T from "./types.js";

export const constantParser = as.coroutine(function (run) {
  const isExport = Boolean(run(as.possibly(as.char("+"))));

  run(as.str("constant"));
  run(as.whitespace);

  const name = run(validIdentifierParser);

  run(as.whitespace);
  run(as.char("="));
  run(as.whitespace);

  const value = run(hexLiteralParser);

  run(as.optionalWhitespace);

  return T.constant({
    isExport,
    name,
    value,
  });
});
