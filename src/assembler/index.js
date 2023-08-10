import parser from "./parser/index.js";
import INSTRUCTION_METADATA from "../instructions/index.js";
import { INSTRUCTION_TYPE as I, INSTRUCTION_TYPE_SIZE } from "../instructions/meta.js";

const REGISTER = {
  IP: 0,
  ACC: 1,
  R1: 2,
  R2: 3,
  R3: 4,
  R4: 5,
  R5: 6,
  R6: 7,
  R7: 8,
  R8: 9,
  SP: 10,
  FP: 11,
};

let program = `
start:
  mov $0a, &0050
loop:
  mov &0050, acc
  dec acc
  mov acc, &0050
  add $03, r2
  jne $00, &[!loop]
end:
  hlt
`.trim();

let output = parser.run(program);
let machineCode = [];
let labels = new Map();

let currentAddress = 0;

output.result.forEach((el) => {
  if (el.type === "LABEL") {
    labels.set(el.value, currentAddress);
  } else {
    let metadata = INSTRUCTION_METADATA[el.value.instruction];

    currentAddress += INSTRUCTION_TYPE_SIZE[metadata.type];
  }
});

let encodeLiteralOrMemory = (literal) => {
  let hexValue;

  if (literal.type === "VARIABLE") {
    if (!labels.has(literal.value)) {
      throw new Error(`label "${literal.value}" wasn't resolved`);
    }

    hexValue = labels.get(literal.value);
  } else {
    hexValue = parseInt(literal.value, 16);
  }

  let highByte = (hexValue & 0xff00) >> 8;
  let lowByte = hexValue & 0x00ff;

  machineCode.push(highByte, lowByte);
};

let encodeLiteral8 = (literal) => {
  let hexValue;

  if (literal.type === "VARIABLE") {
    if (!labels.has(literal.value)) {
      throw new Error(`label "${literal.value}" wasn't resolved`);
    }

    hexValue = labels.get(literal.value);
  } else {
    hexValue = parseInt(literal.value, 16);
  }

  machineCode.push(hexValue & 0x00ff);
};

let encodeRegister = (register) => {
  machineCode.push(REGISTER[register.value.toUpperCase()]);
};

output.result.forEach((instruction) => {
  if (instruction.type !== "INSTRUCTION") return;

  let args = instruction.value.args;
  let metadata = INSTRUCTION_METADATA[instruction.value.instruction];

  machineCode.push(metadata.opcode);

  switch (metadata.type) {
    case I.LIT_REG:
    case I.MEM_REG:
      encodeLiteralOrMemory(args[0]);
      encodeRegister(args[1]);

      break;
    case I.REG_LIT:
    case I.REG_MEM:
      encodeRegister(args[0]);
      encodeLiteralOrMemory(args[1]);

      break;
    case I.REG_LIT_8:
      encodeRegister(args[0]);
      encodeLiteral8(args[1]);

      break;
    case I.LIT_MEM:
      encodeLiteralOrMemory(args[0]);
      encodeLiteralOrMemory(args[1]);

      break;
    case I.REG_REG:
    case I.REG_PTR_REG:
      encodeRegister(args[0]);
      encodeRegister(args[1]);

      break;
    case I.LIT_OFF_REG:
      encodeLiteralOrMemory(args[0]);
      encodeRegister(args[1]);
      encodeRegister(args[2]);

      break;
    case I.SINGLE_REG:
      encodeRegister(args[0]);

      break;
    case I.SINGLE_LIT:
      encodeLiteralOrMemory(args[0]);

      break;
  }
});

console.log(machineCode.map((el) => `0x${el.toString(16).padStart(2, "0")}`).join(" "));
