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
    if (!symbolicNames.has(literal.value)) {
      throw new Error(`label "${literal.value}" wasn't resolved`);
    }

    hexValue = symbolicNames.get(literal.value);
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
    if (!symbolicNames.has(literal.value)) {
      throw new Error(`label "${literal.value}" wasn't resolved`);
    }

    hexValue = symbolicNames.get(literal.value);
  } else {
    hexValue = parseInt(literal.value, 16);
  }

  return [hexValue & 0x00ff];
};

let encodeRegister = (register) => [registerMap.get(register.value)];

const encodeData8 = (node) => node.value.values.map((byte) => parseInt(byte.value, 16) & 0xff);
const encodeData16 = (node) =>
  node.value.values
    .map((byte) => {
      const parsed = parseInt(byte.value, 16);

      return [(parsed & 0xff00) >> 8, parsed & 0xff];
    })
    .flat();

let program = `
constant code_constant = $C0DE

+data8 bytes = { $01, $02, $03, $04 }
data16 words = { $0506, $0708, $090A, $0B0C }

code:
  mov [!code_constant], &1234
`.trim();

let output = parser.run(program);

if (output.isError) {
  throw new Error(output.error);
}

let machineCode = [];

let { symbolicNames } = output.result.reduce(
  (acc, node) => {
    switch (node.type) {
      case "LABEL": {
        acc.symbolicNames.set(node.value, acc.currentAddress);

        return acc;
      }
      case "CONSTANT": {
        acc.symbolicNames.set(node.value.name, parseInt(node.value.value.value, 16) & 0xffff);

        return acc;
      }
      case "DATA": {
        acc.symbolicNames.set(node.value.name, acc.currentAddress);

        const size = node.value.size === 16 ? 2 : 1;
        const totalSize = node.value.values.length * size;

        return {
          ...acc,
          currentAddress: acc.currentAddress + totalSize,
        };
      }
      default: {
        let metadata = INSTRUCTION_METADATA[node.value.instruction];

        return {
          ...acc,
          currentAddress: acc.currentAddress + INSTRUCTION_TYPE_SIZE[metadata.type],
        };
      }
    }
  },
  {
    symbolicNames: new Map(),
    currentAddress: 0,
  }
);

output.result.forEach((node) => {
  if (node.type === "LABEL" || node.type === "CONSTANT") {
    return;
  }

  if (node.type === "DATA") {
    if (node.value.size === 8) {
      machineCode.push(...encodeData8(node));
    } else {
      machineCode.push(...encodeData16(node));
    }

    return;
  }

  let args = node.value.args;
  let metadata = INSTRUCTION_METADATA[node.value.instruction];

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

console.log("RESULT:");
console.log("RAW:", machineCode);
console.log(machineCode.map((el) => `0x${el.toString(16).padStart(2, "0")}`).join(" "));
