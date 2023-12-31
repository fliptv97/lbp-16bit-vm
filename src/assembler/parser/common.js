import as from "arcsecond";

import registers from "../../registers.js";
import * as T from "./types.js";
import { mapJoin } from "./util.js";

export let ignoreCaseParser = (str) => as.regex(new RegExp(`^${str}`, "i"));

export let registerParser = as.choice(registers.map((r) => ignoreCaseParser(r))).map(T.register);

let hexDigitParser = as.regex(/^[0-9A-F]/i);
export let hexLiteralParser = as
  .char("$")
  .chain(() => mapJoin(as.many1(hexDigitParser)))
  .map(T.hexLiteral);

export let addressParser = as
  .char("&")
  .chain(() => mapJoin(as.many1(hexDigitParser)))
  .map(T.address);

export let validIdentifierParser = mapJoin(
  as.sequenceOf([
    as.regex(/^[a-z_]/i),
    as.possibly(as.regex(/^[a-z0-9_]+/i)).map((x) => (x === null ? "" : x)),
  ])
);
export let variableParser = as
  .sequenceOf([as.char("!"), validIdentifierParser])
  .map((results) => T.variable(results[1]));

export let labelParser = as
  .sequenceOf([validIdentifierParser, as.char(":"), as.optionalWhitespace])
  .map(([labelName]) => labelName)
  .map(T.label);

export let operatorParser = as.choice([
  as.char("+").map(T.opPlus),
  as.char("-").map(T.opMinus),
  as.char("*").map(T.opMultiply),
]);

export let peek = as.lookAhead(as.regex(/^./));
