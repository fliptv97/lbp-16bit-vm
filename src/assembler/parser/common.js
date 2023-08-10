import as from "arcsecond";

import * as T from "./types.js";
import { mapJoin } from "./util.js";

export let ignoreCaseParser = (str) => as.regex(new RegExp(`^${str}`, "i"));

let registers = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "sp", "fp", "ip", "acc"];
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

export let validIdentifier = mapJoin(
  as.sequenceOf([
    as.regex(/^[a-z_]/i),
    as.possibly(as.regex(/^[a-z0-9_]+/i)).map((x) => (x === null ? "" : x)),
  ])
);
export let variableParser = as
  .sequenceOf([as.char("!"), validIdentifier])
  .map((results) => T.variable(results[1]));

export let labelParser = as
  .sequenceOf([validIdentifier, as.char(":"), as.optionalWhitespace])
  .map(([labelName]) => labelName)
  .map(T.label);

export let operatorParser = as.choice([
  as.char("+").map(T.opPlus),
  as.char("-").map(T.opMinus),
  as.char("*").map(T.opMultiply),
]);

export let peek = as.lookAhead(as.regex(/^./));
