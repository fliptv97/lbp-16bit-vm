import as from "arcsecond";

import * as T from "./types.js";
import { ignoreCaseParser, hexLiteralParser, addressParser, registerParser } from "./common.js";
import { squareBracketExpressionParser } from "./expressions.js";

export let litReg = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(as.choice([hexLiteralParser, squareBracketExpressionParser]));

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(registerParser);

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2],
    });
  });

export let regLit = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(registerParser);

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(as.choice([hexLiteralParser, squareBracketExpressionParser]));

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2],
    });
  });

export let regReg = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(registerParser);

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(registerParser);

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2],
    });
  });

export let regMem = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(registerParser);

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(
      as.choice([addressParser, as.char("&").chain(() => squareBracketExpressionParser)])
    );

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2],
    });
  });

export let memReg = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(
      as.choice([addressParser, as.char("&").chain(() => squareBracketExpressionParser)])
    );

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(registerParser);

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2],
    });
  });

export let litMem = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(as.choice([hexLiteralParser, squareBracketExpressionParser]));

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(
      as.choice([addressParser, as.char("&").chain(() => squareBracketExpressionParser)])
    );

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2],
    });
  });

export let regPtrReg = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(as.char("&").chain(() => registerParser));

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(registerParser);

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2],
    });
  });

export let litOffReg = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(as.choice([hexLiteralParser, squareBracketExpressionParser]));

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg2 = run(as.char("&").chain(() => registerParser));

    run(as.optionalWhitespace);
    run(as.char(","));
    run(as.optionalWhitespace);

    let arg3 = run(registerParser);

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1, arg2, arg3],
    });
  });

export let noArgs = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [],
    });
  });

export let singleReg = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(registerParser);

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1],
    });
  });

export let singleLit = (mnemonic, type) =>
  as.coroutine((run) => {
    run(ignoreCaseParser(mnemonic));
    run(as.whitespace);

    let arg1 = run(as.choice([hexLiteralParser, squareBracketExpressionParser]));

    run(as.optionalWhitespace);

    return T.instruction({
      instruction: type,
      args: [arg1],
    });
  });
