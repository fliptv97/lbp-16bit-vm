export const INSTRUCTION_TYPE = {
  LIT_REG: "LIT_REG",
  REG_LIT: "REG_LIT",
  REG_LIT_8: "REG_LIT_8",
  REG_REG: "REG_REG",
  REG_MEM: "REG_MEM",
  MEM_REG: "MEM_REG",
  LIT_MEM: "LIT_MEM",
  REG_PTR_REG: "REG_PTR_REG",
  LIT_OFF_REG: "LIT_OFF_REG",
  NO_ARGS: "NO_ARGS",
  SINGLE_REG: "SINGLE_REG",
  SINGLE_LIT: "SINGLE_LIT",
};

// In bytes
export const INSTRUCTION_TYPE_SIZE = {
  LIT_REG: 4,
  REG_LIT: 4,
  REG_LIT_8: 3,
  REG_REG: 3,
  REG_MEM: 4,
  MEM_REG: 4,
  LIT_MEM: 5,
  REG_PTR_REG: 3,
  LIT_OFF_REG: 5,
  NO_ARGS: 1,
  SINGLE_REG: 2,
  SINGLE_LIT: 3,
};

export let meta = [
  { instruction: "INT", opcode: 0xfd, type: INSTRUCTION_TYPE.SINGLE_LIT, mnemonic: "int" },
  { instruction: "RET_INT", opcode: 0xfc, type: INSTRUCTION_TYPE.NO_ARGS, mnemonic: "rti" },

  { instruction: "MOV_LIT_REG", opcode: 0x10, type: INSTRUCTION_TYPE.LIT_REG, mnemonic: "mov" },
  { instruction: "MOV_REG_REG", opcode: 0x11, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "mov" },
  { instruction: "MOV_REG_MEM", opcode: 0x12, type: INSTRUCTION_TYPE.REG_MEM, mnemonic: "mov" },
  { instruction: "MOV_MEM_REG", opcode: 0x13, type: INSTRUCTION_TYPE.MEM_REG, mnemonic: "mov" },
  { instruction: "MOV_LIT_MEM", opcode: 0x14, type: INSTRUCTION_TYPE.LIT_MEM, mnemonic: "mov" },
  {
    instruction: "MOV_REG_PTR_REG",
    opcode: 0x15,
    type: INSTRUCTION_TYPE.REG_PTR_REG,
    mnemonic: "mov",
  },
  {
    instruction: "MOV_LIT_OFF_REG",
    opcode: 0x16,
    type: INSTRUCTION_TYPE.LIT_OFF_REG,
    mnemonic: "mov",
  },
  { instruction: "PSH_LIT", opcode: 0x17, type: INSTRUCTION_TYPE.SINGLE_LIT, mnemonic: "psh" },
  { instruction: "PSH_REG", opcode: 0x18, type: INSTRUCTION_TYPE.SINGLE_REG, mnemonic: "psh" },
  { instruction: "POP", opcode: 0x1a, type: INSTRUCTION_TYPE.SINGLE_REG, mnemonic: "pop" },
  { instruction: "CAL_LIT", opcode: 0x5e, type: INSTRUCTION_TYPE.SINGLE_LIT, mnemonic: "cal" },
  { instruction: "CAL_REG", opcode: 0x5f, type: INSTRUCTION_TYPE.SINGLE_REG, mnemonic: "cal" },
  { instruction: "RET", opcode: 0x60, type: INSTRUCTION_TYPE.NO_ARGS, mnemonic: "ret" },

  { instruction: "ADD_LIT_REG", opcode: 0x1b, type: INSTRUCTION_TYPE.LIT_REG, mnemonic: "add" },
  { instruction: "ADD_REG_REG", opcode: 0x1c, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "add" },
  { instruction: "SUB_LIT_REG", opcode: 0x1d, type: INSTRUCTION_TYPE.LIT_REG, mnemonic: "sub" },
  { instruction: "SUB_REG_LIT", opcode: 0x1e, type: INSTRUCTION_TYPE.REG_LIT, mnemonic: "sub" },
  { instruction: "SUB_REG_REG", opcode: 0x1f, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "sub" },
  { instruction: "MUL_LIT_REG", opcode: 0x20, type: INSTRUCTION_TYPE.LIT_REG, mnemonic: "mul" },
  { instruction: "MUL_REG_REG", opcode: 0x21, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "mul" },
  { instruction: "INC_REG", opcode: 0x35, type: INSTRUCTION_TYPE.SINGLE_REG, mnemonic: "inc" },
  { instruction: "DEC_REG", opcode: 0x36, type: INSTRUCTION_TYPE.SINGLE_REG, mnemonic: "dec" },

  { instruction: "LSF_REG_LIT", opcode: 0x26, type: INSTRUCTION_TYPE.REG_LIT_8, mnemonic: "lsf" },
  { instruction: "LSF_REG_REG", opcode: 0x27, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "lsf" },
  { instruction: "RSF_REG_LIT", opcode: 0x2a, type: INSTRUCTION_TYPE.REG_LIT_8, mnemonic: "rsf" },
  { instruction: "RSF_REG_REG", opcode: 0x2b, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "rsf" },
  { instruction: "AND_REG_LIT", opcode: 0x2e, type: INSTRUCTION_TYPE.REG_LIT, mnemonic: "and" },
  { instruction: "AND_REG_REG", opcode: 0x2f, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "and" },
  { instruction: "OR_REG_LIT", opcode: 0x30, type: INSTRUCTION_TYPE.REG_LIT, mnemonic: "or" },
  { instruction: "OR_REG_REG", opcode: 0x31, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "or" },
  { instruction: "XOR_REG_LIT", opcode: 0x32, type: INSTRUCTION_TYPE.REG_LIT, mnemonic: "xor" },
  { instruction: "XOR_REG_REG", opcode: 0x33, type: INSTRUCTION_TYPE.REG_REG, mnemonic: "xor" },
  { instruction: "NOT", opcode: 0x34, type: INSTRUCTION_TYPE.SINGLE_REG, mnemonic: "not" },

  { instruction: "JEQ_REG", opcode: 0x3e, type: INSTRUCTION_TYPE.REG_MEM, mnemonic: "jeq" },
  { instruction: "JEQ_LIT", opcode: 0x3f, type: INSTRUCTION_TYPE.LIT_MEM, mnemonic: "jeq" },
  { instruction: "JNE_REG", opcode: 0x40, type: INSTRUCTION_TYPE.REG_MEM, mnemonic: "jne" },
  { instruction: "JNE_LIT", opcode: 0x41, type: INSTRUCTION_TYPE.LIT_MEM, mnemonic: "jne" },
  { instruction: "JLT_REG", opcode: 0x42, type: INSTRUCTION_TYPE.REG_MEM, mnemonic: "jlt" },
  { instruction: "JLT_LIT", opcode: 0x43, type: INSTRUCTION_TYPE.LIT_MEM, mnemonic: "jlt" },
  { instruction: "JGT_REG", opcode: 0x44, type: INSTRUCTION_TYPE.REG_MEM, mnemonic: "jgt" },
  { instruction: "JGT_LIT", opcode: 0x45, type: INSTRUCTION_TYPE.LIT_MEM, mnemonic: "jgt" },
  { instruction: "JLE_REG", opcode: 0x46, type: INSTRUCTION_TYPE.REG_MEM, mnemonic: "jle" },
  { instruction: "JLE_LIT", opcode: 0x47, type: INSTRUCTION_TYPE.LIT_MEM, mnemonic: "jle" },
  { instruction: "JGE_REG", opcode: 0x48, type: INSTRUCTION_TYPE.REG_MEM, mnemonic: "jge" },
  { instruction: "JGE_LIT", opcode: 0x49, type: INSTRUCTION_TYPE.LIT_MEM, mnemonic: "jge" },

  { instruction: "HLT", opcode: 0xff, type: INSTRUCTION_TYPE.NO_ARGS, mnemonic: "hlt" },
];
