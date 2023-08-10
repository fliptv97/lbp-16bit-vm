import as from "arcsecond";

import * as T from "./types.js";
import { peek, hexLiteralParser, operatorParser, variableParser } from "./common.js";

const OPERATIONS_PRIORITY = {
  OP_MULTIPLY: 2,
  OP_PLUS: 1,
  OP_MINUS: 0,
};

let disambiguateOrderOfOperations = (expression) => {
  if (
    expression.type !== "SQUARE_BRACKET_EXPRESSION" &&
    expression.type !== "BRACKETED_EXPRESSION"
  ) {
    return expression;
  }

  if (expression.value.length === 1) {
    return expression.value[0];
  }

  let candidateExpression = {
    priority: -Infinity,
  };

  for (let i = 1; i < expression.value.length; i += 2) {
    let level = OPERATIONS_PRIORITY[expression.value[i].type];

    if (level > candidateExpression.priority) {
      candidateExpression = {
        priority: level,
        a: i - 1,
        b: i + 1,
        op: expression.value[i],
      };
    }
  }

  let newExpression = T.bracketedExpression([
    ...expression.value.slice(0, candidateExpression.a),
    T.binaryOperation({
      a: disambiguateOrderOfOperations(expression.value[candidateExpression.a]),
      b: disambiguateOrderOfOperations(expression.value[candidateExpression.b]),
      op: candidateExpression.op,
    }),
    ...expression.value.slice(candidateExpression.b + 1),
  ]);

  return disambiguateOrderOfOperations(newExpression);
};

let typifyBracketedExpression = (expression) =>
  T.bracketedExpression(
    expression.map((element) =>
      Array.isArray(element) ? typifyBracketedExpression(element) : element
    )
  );

export let bracketedExpressionParser = as.coroutine((run) => {
  const STATES = {
    OPEN_BRACKET: "OPEN_BRACKET",
    OPERATOR_OR_CLOSING_BRACKET: "OPERATOR_OR_CLOSING_BRACKET",
    ELEMENT_OR_OPENING_BRACKET: "ELEMENT_OR_OPENING_BRACKET",
    CLOSE_BRACKET: "CLOSE_BRACKET",
  };

  let state = STATES.ELEMENT_OR_OPENING_BRACKET;

  let expression = [];
  let stack = [expression];

  run(as.char("("));

  while (true) {
    let nextChar = run(peek);

    if (state === STATES.OPEN_BRACKET) {
      run(as.char("("));

      expression.push([]);
      stack.push(expression.at(-1));

      run(as.optionalWhitespace);

      state = STATES.ELEMENT_OR_OPENING_BRACKET;
    } else if (state === STATES.CLOSE_BRACKET) {
      run(as.char(")"));

      stack.pop();

      if (stack.length === 0) break;

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

export let squareBracketExpressionParser = as
  .coroutine((run) => {
    run(as.char("["));
    run(as.optionalWhitespace);

    const STATES = {
      EXPECT_ELEMENT: "EXPECT_ELEMENT",
      EXPECT_OPERATOR: "EXPECT_OPERATOR",
    };

    let expression = [];
    let state = STATES.EXPECT_ELEMENT;

    while (true) {
      if (state === STATES.EXPECT_ELEMENT) {
        let nextState = run(
          as.choice([bracketedExpressionParser, hexLiteralParser, variableParser])
        );

        expression.push(nextState);

        state = STATES.EXPECT_OPERATOR;

        run(as.optionalWhitespace);
      } else if (state === STATES.EXPECT_OPERATOR) {
        let nextChar = run(peek);

        if (nextChar === "]") {
          run(as.char("]"));
          run(as.optionalWhitespace);

          break;
        }

        let nextState = run(operatorParser);

        expression.push(nextState);

        state = STATES.EXPECT_ELEMENT;

        run(as.optionalWhitespace);
      }
    }

    return T.squareBracketExpression(expression);
  })
  .map(disambiguateOrderOfOperations);
