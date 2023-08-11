import parser from "./parser/index.js";
import INSTRUCTION_METADATA from "../instructions/index.js";
import { INSTRUCTION_TYPE as I, INSTRUCTION_TYPE_SIZE } from "../instructions/meta.js";
import registers from "../registers.js";

let registerMap = registers.reduce((map, registerName, index) => {
  map.set(registerName, index);

  return map;
}, new Map());

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

  return [highByte, lowByte];
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

  return [hexValue & 0x00ff];
};

let encodeRegister = (register) => [registerMap.get(register.value)];

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

let { labels } = output.result.reduce(
  (acc, el) => {
    if (el.type === "LABEL") {
      acc.labels.set(el.value, acc.currentAddress);

      return acc;
    } else {
      let metadata = INSTRUCTION_METADATA[el.value.instruction];

      return {
        ...acc,
        currentAddress: acc.currentAddress + INSTRUCTION_TYPE_SIZE[metadata.type],
      };
    }
  },
  {
    labels: new Map(),
    currentAddress: 0,
  }
);

output.result.forEach((instruction) => {
  if (instruction.type !== "INSTRUCTION") return;

  let args = instruction.value.args;
  let metadata = INSTRUCTION_METADATA[instruction.value.instruction];

  machineCode.push(metadata.opcode);

  switch (metadata.type) {
    case I.LIT_REG:
    case I.MEM_REG:
      machineCode.push(...encodeLiteralOrMemory(args[0]));
      machineCode.push(...encodeRegister(args[1]));

      break;
    case I.REG_LIT:
    case I.REG_MEM:
      machineCode.push(...encodeRegister(args[0]));
      machineCode.push(...encodeLiteralOrMemory(args[1]));

      break;
    case I.REG_LIT_8:
      machineCode.push(...encodeRegister(args[0]));
      machineCode.push(...encodeLiteral8(args[1]));

      break;
    case I.LIT_MEM:
      machineCode.push(...encodeLiteralOrMemory(args[0]));
      machineCode.push(...encodeLiteralOrMemory(args[1]));

      break;
    case I.REG_REG:
    case I.REG_PTR_REG:
      machineCode.push(...encodeRegister(args[0]));
      machineCode.push(...encodeRegister(args[1]));

      break;
    case I.LIT_OFF_REG:
      machineCode.push(...encodeLiteralOrMemory(args[0]));
      machineCode.push(...encodeRegister(args[1]));
      machineCode.push(...encodeRegister(args[2]));

      break;
    case I.SINGLE_REG:
      machineCode.push(...encodeRegister(args[0]));

      break;
    case I.SINGLE_LIT:
      machineCode.push(...encodeLiteralOrMemory(args[0]));

      break;
  }
});

console.log(machineCode.map((el) => `0x${el.toString(16).padStart(2, "0")}`).join(" "));
