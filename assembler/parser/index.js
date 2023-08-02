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

const disambiguateOrderOfOperations = (expression) => {
  if (
    expression.type !== "SQUARE_BRACKET_EXPRESSION" &&
    expression.type !== "BRACKETED_EXPRESSION"
  ) {
    return expression;
  }

  if (expression.value.length === 1) {
    return expression.value[0];
  }

  const PRIORITIES = {
    OP_MULTIPLY: 2,
    OP_PLUS: 1,
    OP_MINUS: 0,
  };

  let candidateExpression = {
    priority: -Infinity,
  };

  for (let i = 1; i < expression.value.length; i += 2) {
    const level = PRIORITIES[expression.value[i].type];

    if (level > candidateExpression.priority) {
      candidateExpression = {
        priority: level,
        a: i - 1,
        b: i + 1,
        op: expression.value[i],
      };
    }
  }

  const newExpression = asType("BRACKETED_EXPRESSION")([
    ...expression.value.slice(0, candidateExpression.a),
    asType("BINARY_OPERATION")({
      a: disambiguateOrderOfOperations(expression.value[candidateExpression.a]),
      b: disambiguateOrderOfOperations(expression.value[candidateExpression.b]),
      op: candidateExpression.op,
    }),
    ...expression.value.slice(candidateExpression.b + 1),
  ]);

  return disambiguateOrderOfOperations(newExpression);
};

const registers = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "sp", "fp", "ip", "acc"];
const registerParser = as.choice(registers.map((r) => ignoreCaseParser(r))).map(asType("REGISTER"));

const hexDigitParser = as.regex(/^[0-9A-F]/i);
const hexLiteralParser = as
  .char("$")
  .chain(() => mapJoin(as.many1(hexDigitParser)))
  .map(asType("HEX_LITERAL"));

const validIdentifier = mapJoin(
  as.sequenceOf([
    as.regex(/^[a-z_]/i),
    as.possibly(as.regex(/^[a-z0-9_]+/i)).map((x) => (x === null ? "" : x)),
  ])
);
const variableParser = as
  .sequenceOf([as.char("!"), validIdentifier])
  .map((results) => asType("VARIABLE")(results[1]));

const operatorParser = as.choice([
  as.char("+").map(asType("OP_PLUS")),
  as.char("-").map(asType("OP_MINUS")),
  as.char("*").map(asType("OP_MULTIPLY")),
]);

const typifyBracketedExpression = (expression) =>
  asType("BRACKETED_EXPRESSION")(
    expression.map((element) =>
      Array.isArray(element) ? typifyBracketedExpression(element) : element
    )
  );

const bracketedExpressionParser = as.coroutine((run) => {
  const STATES = {
    OPEN_BRACKET: "OPEN_BRACKET",
    OPERATOR_OR_CLOSING_BRACKET: "OPERATOR_OR_CLOSING_BRACKET",
    ELEMENT_OR_OPENING_BRACKET: "ELEMENT_OR_OPENING_BRACKET",
    CLOSE_BRACKET: "CLOSE_BRACKET",
  };

  let state = STATES.ELEMENT_OR_OPENING_BRACKET;

  const expression = [];
  const stack = [expression];

  run(as.char("("));

  while (true) {
    const nextChar = run(peek);

    if (state === STATES.OPEN_BRACKET) {
      run(as.char("("));

      expression.push([]);
      stack.push(expression.at(-1));

      run(as.optionalWhitespace);

      state = STATES.ELEMENT_OR_OPENING_BRACKET;
    } else if (state === STATES.CLOSE_BRACKET) {
      run(as.char(")"));

      stack.pop();

      if (stack.length === 0) {
        break;
      }

      run(as.optionalWhitespace);

      state = STATES.OPERATOR_OR_CLOSING_BRACKET;
    } else if (state === STATES.ELEMENT_OR_OPENING_BRACKET) {
      if (nextChar === ")") {
        run(as.fail("Unexpected end of expression"));
      }

      if (nextChar === "(") {
        state = STATES.OPEN_BRACKET;
      } else {
        stack.at(-1).push(run(as.choice([hexLiteralParser, variableParser])));

        run(as.optionalWhitespace);

        state = STATES.OPERATOR_OR_CLOSING_BRACKET;
      }
    } else if (state === STATES.OPERATOR_OR_CLOSING_BRACKET) {
      if (nextChar === ")") {
        state = STATES.CLOSE_BRACKET;

        continue;
      }

      stack.at(-1).push(run(operatorParser));

      run(as.optionalWhitespace);

      state = STATES.ELEMENT_OR_OPENING_BRACKET;
    } else {
      throw new Error(`Unknown state: ${state}`);
    }
  }

  return typifyBracketedExpression(expression);
});

const squareBracketExpressionParser = as
  .coroutine((run) => {
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
  })
  .map(disambiguateOrderOfOperations);

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

const state = movLitToReg.run("mov [$42 + !loc - ($05 * ($31 + !var) - $07)], r4");

deepLog(state);
