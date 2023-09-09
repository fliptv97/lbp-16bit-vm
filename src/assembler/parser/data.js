import as from "arcsecond";

import { validIdentifierParser, hexLiteralParser } from "./common.js";
import * as T from "./types.js";

const optionalWhitespaceSurrounedParser = as.between(as.optionalWhitespace)(as.optionalWhitespace);
const commaSeparatedParser = as.sepBy(optionalWhitespaceSurrounedParser(as.char(",")));

const dataParser = (size) =>
  as.coroutine(function (run) {
    const isExport = Boolean(run(as.possibly(as.char("+"))));

    run(as.str(`data${size}`));
    run(as.whitespace);

    const name = run(validIdentifierParser);

    run(as.whitespace);
    run(as.char("="));
    run(as.whitespace);
    run(as.char("{"));
    run(as.whitespace);

    const values = run(commaSeparatedParser(hexLiteralParser));

    run(as.whitespace);
    run(as.char("}"));
    run(as.optionalWhitespace);

    return T.data({
      size,
      isExport,
      name,
      values,
    });
  });

export const data8Parser = dataParser(8);
export const data16Parser = dataParser(16);
