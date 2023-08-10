import as from "arcsecond";
import {
  regReg,
  litReg,
  memReg,
  regMem,
  litMem,
  regPtrReg,
  litOffReg,
  noArgs,
  singleReg,
  singleLit,
} from "./formats.js";

export let mov = as.choice([
  regReg("mov", "MOV_REG_REG"),
  litReg("mov", "MOV_LIT_REG"),
  memReg("mov", "MOV_MEM_REG"),
  regMem("mov", "MOV_REG_MEM"),
  litMem("mov", "MOV_LIT_MEM"),
  regPtrReg("mov", "MOV_REG_PTR_REG"),
  litOffReg("mov", "MOV_LIT_OFF_REG"),
]);

export let add = as.choice([regReg("add", "ADD_REG_REG"), litReg("add", "ADD_LIT_REG")]);
export let sub = as.choice([regReg("sub", "SUB_REG_REG"), litReg("sub", "SUB_LIT_REG")]);
export let mul = as.choice([regReg("mul", "MUL_REG_REG"), litReg("mul", "MUL_LIT_REG")]);

export let lsf = as.choice([regReg("lsf", "LSF_REG_REG"), litReg("lsf", "LSF_LIT_REG")]);
export let rsf = as.choice([regReg("rsf", "RSF_REG_REG"), litReg("rsf", "RSF_LIT_REG")]);

export let and = as.choice([regReg("and", "AND_REG_REG"), litReg("and", "AND_LIT_REG")]);
export let or = as.choice([regReg("or", "OR_REG_REG"), litReg("or", "OR_LIT_REG")]);
export let xor = as.choice([regReg("xor", "XOR_REG_REG"), litReg("xor", "XOR_LIT_REG")]);

export let inc = singleReg("inc", "INC_REG");
export let dec = singleReg("dec", "DEC_REG");
export let not = singleReg("not", "NOT");

export let jeq = as.choice([regMem("jeq", "JEQ_REG"), litMem("jeq", "JEQ_LIT")]);
export let jne = as.choice([regMem("jne", "JNE_REG"), litMem("jne", "JNE_LIT")]);
export let jlt = as.choice([regMem("jlt", "JLT_REG"), litMem("jlt", "JLT_LIT")]);
export let jgt = as.choice([regMem("jgt", "JGT_REG"), litMem("jgt", "JGT_LIT")]);
export let jle = as.choice([regMem("jle", "JLE_REG"), litMem("jle", "JLE_LIT")]);
export let jge = as.choice([regMem("jge", "JGE_REG"), litMem("jge", "JGE_LIT")]);

export let psh = as.choice([singleLit("psh", "PSH_LIT"), singleReg("psh", "PSH_REG")]);
export let pop = singleReg("pop", "POP_REG");

export let cal = as.choice([singleLit("cal", "CAL_LIT"), singleReg("cal", "CAL_REG")]);
export let ret = noArgs("reg", "RET");
export let hlt = noArgs("hlt", "HLT");

export default as.choice([
  mov,
  add,
  sub,
  mul,
  lsf,
  rsf,
  and,
  or,
  xor,
  inc,
  dec,
  not,
  jeq,
  jne,
  jlt,
  jgt,
  jle,
  jge,
  psh,
  pop,
  cal,
  ret,
  hlt,
]);
