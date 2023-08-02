import { inspect } from "util";
import as from "arcsecond";

const deepLog = (x) =>
  console.log(
    inspect(x, {
      depth: Infinity,
      colors: true,
    })
  );

const asType = (type) => (value) => ({ type, value });
const mapJoin = (parser) => parser.map((items) => items.join(""));
const peek = as.lookAhead(as.regex(/^./));

const ignoreCaseParser = (str) => as.regex(new RegExp(`^${str}`, "i"));

const registers = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "sp", "fp", "ip", "acc"];
const registerParser = as.choice(registers.map((r) => ignoreCaseParser(r))).map(asType("REGISTER"));

const hexDigitParser = as.regex(/^[0-9A-F]/i);
const hexLiteralParser = as
  .char("$")
  .chain(() => mapJoin(as.many1(hexDigitParser)))
  .map(asType("HEX_LITERAL"));

const validIdentifier = mapJoin(
  as.sequenceOf([
    as.regex(/^a-z_/i),
    as.possibly(as.regex(/^a-z0-9_/i)).map((x) => (x === null ? "" : x)),
  ])
);
const variableParser = mapJoin(as.sequenceOf(as.char("!"), validIdentifier)).map(
  asType("VARIABLE")
);

const operatorParser = as.choice([
  as.char("+").map(asType("OP_PLUS")),
  as.char("-").map(asType("OP_MINUS")),
  as.char("*").map(asType("OP_MULTIPLY")),
]);

const squareBracketExpressionParser = as.coroutine((run) => {
  run(as.char("["));
  run(as.optionalWhitespace);

  const STATES = {
    EXPECT_ELEMENT: "EXPECT_ELEMENT",
    EXPECT_OPERATOR: "EXPECT_OPERATOR",
  };

  const expression = [];

  let state = STATES.EXPECT_ELEMENT;

  while (true) {
    if (state === STATES.EXPECT_ELEMENT) {
      const resultState = run(
        as.choice([bracketedExpressionParser, hexLiteralParser, variableParser])
      );

      expression.push(resultState);

      state = STATES.EXPECT_OPERATOR;

      run(as.optionalWhitespace);
    } else if (state === STATES.EXPECT_OPERATOR) {
      const nextChar = run(peek);

      if (nextChar === "]") {
        run(as.char("]"));
        run(as.optionalWhitespace);

        break;
      }

      const resultState = run(operatorParser);

      expression.push(resultState);

      state = STATES.EXPECT_ELEMENT;

      run(as.optionalWhitespace);
    }
  }

  return asType("SQUARE_BRACKET_EXPRESSION")(expression);
});

const movLitToReg = as.coroutine((run) => {
  run(ignoreCaseParser("mov"));
  run(as.whitespace);

  const arg1 = run(as.choice([hexLiteralParser, squareBracketExpressionParser]));

  run(as.optionalWhitespace);
  run(as.char(","));
  run(as.optionalWhitespace);

  const arg2 = run(registerParser);

  run(as.optionalWhitespace);

  return asType("INSTRUCTION")({
    instruction: "MOV_LIT_REG",
    args: [arg1, arg2],
  });
});

const state = variableParser.run("!loc");

deepLog(state);
