export const MOV_LIT_REG = 0x10;
export const MOV_REG_REG = 0x11;
export const MOV_REG_MEM = 0x12;
export const MOV_MEM_REG = 0x13;
export const MOV_LIT_MEM = 0x14;
export const MOV_REG_PTR_REG = 0x15;
export const MOV_LIT_OFF_REG = 0x16;

export const PSH_LIT = 0x17;
export const PSH_REG = 0x18;
export const POP = 0x1a;
export const CAL_LIT = 0x5e;
export const CAL_REG = 0x5f;
export const RET = 0x60;

export const ADD_LIT_REG = 0x1b;
export const ADD_REG_REG = 0x1c;
export const SUB_LIT_REG = 0x1d;
export const SUB_REG_LIT = 0x1e;
export const SUB_REG_REG = 0x1f;
export const MUL_LIT_REG = 0x20;
export const MUL_REG_REG = 0x21;
export const INC_REG = 0x35;
export const DEC_REG = 0x36;

export const LSF_REG_LIT = 0x26;
export const LSF_REG_REG = 0x27;
export const RSF_REG_LIT = 0x2a;
export const RSF_REG_REG = 0x2b;
export const AND_REG_LIT = 0x2e;
export const AND_REG_REG = 0x2f;
export const OR_REG_LIT = 0x30;
export const OR_REG_REG = 0x31;
export const XOR_REG_LIT = 0x32;
export const XOR_REG_REG = 0x33;
export const NOT = 0x34;

export const JEQ_REG = 0x3e;
export const JEQ_LIT = 0x3f;
export const JNE_REG = 0x40;
export const JNE_LIT = 0x41;
export const JLT_REG = 0x42;
export const JLT_LIT = 0x43;
export const JGT_REG = 0x44;
export const JGT_LIT = 0x45;
export const JLE_REG = 0x46;
export const JLE_LIT = 0x47;
export const JGE_REG = 0x48;
export const JGE_LIT = 0x49;

export const HLT = 0xff;
