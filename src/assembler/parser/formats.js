import as from "arcsecond";

import * as T from "./types.js";
import { ignoreCaseParser, hexLiteralParser, addressParser, registerParser } from "./common.js";
import { squareBracketExpressionParser } from "./expressions.js";

let base = (mnemonic, instruction, argsParsers) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));

    let args = [];

    if (argsParsers.length > 0) {
      run(as.whitespace);

      args.push(run(argsParsers[0]));

      argsParsers.slice(1).forEach((parser) => {
        run(as.optionalWhitespace);
        run(as.char(","));
        run(as.optionalWhitespace);

        args.push(run(parser));
      });
    }

    run(as.optionalWhitespace);

    return T.instruction({ instruction, args });
  });

export let litReg = (mnemonic, type) =>
  base(mnemonic, type, [
    as.choice([hexLiteralParser, squareBracketExpressionParser]),
    registerParser,
  ]);

export let regLit = (mnemonic, type) =>
  base(mnemonic, type, [
    registerParser,
    as.choice([hexLiteralParser, squareBracketExpressionParser]),
  ]);

export let regReg = (mnemonic, type) => base(mnemonic, type, [registerParser, registerParser]);

export let regMem = (mnemonic, type) =>
  base(mnemonic, type, [
    registerParser,
    as.choice([addressParser, as.char("&").chain(() => squareBracketExpressionParser)]),
  ]);

export let memReg = (mnemonic, type) =>
  base(mnemonic, type, [
    as.choice([addressParser, as.char("&").chain(() => squareBracketExpressionParser)]),
    registerParser,
  ]);

export let litMem = (mnemonic, type) =>
  base(mnemonic, type, [
    as.choice([hexLiteralParser, squareBracketExpressionParser]),
    as.choice([addressParser, as.char("&").chain(() => squareBracketExpressionParser)]),
  ]);

export let regPtrReg = (mnemonic, type) =>
  base(mnemonic, type, [as.char("&").chain(() => registerParser), registerParser]);

export let litOffReg = (mnemonic, type) =>
  base(mnemonic, type, [
    as.choice([hexLiteralParser, squareBracketExpressionParser]),
    as.char("&").chain(() => registerParser),
  ]);

export let noArgs = (mnemonic, type) => base(mnemonic, type, []);

export let singleReg = (mnemonic, type) => base(mnemonic, type, [registerParser]);

export let singleLit = (mnemonic, type) =>
  base(mnemonic, type, [as.choice([hexLiteralParser, squareBracketExpressionParser])]);
