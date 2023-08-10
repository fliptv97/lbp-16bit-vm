import { asType } from "./util.js";

export let register = asType("REGISTER");
export let hexLiteral = asType("HEX_LITERAL");
export let address = asType("ADDRESS");
export let variable = asType("VARIABLE");

export let opPlus = asType("OP_PLUS");
export let opMinus = asType("OP_MINUS");
export let opMultiply = asType("OP_MULTIPLY");

export let binaryOperation = asType("BINARY_OPERATION");
export let bracketedExpression = asType("BRACKETED_EXPRESSION");
export let squareBracketExpression = asType("SQUARE_BRACKET_EXPRESSION");

export let instruction = asType("INSTRUCTION");
export let label = asType("LABEL");
