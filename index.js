import createScreenDevice from "./screen-device.js";
import createMemory from "./create-memory.js";
import MemoryMapper from "./memory-mapper.js";
import CPU from "./cpu.js";
import * as instructions from "./instructions.js";

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;
const R3 = 4;
const R4 = 5;
const R5 = 6;
const R6 = 7;
const R7 = 8;
const R8 = 9;
const SP = 10;
const FP = 11;

const MM = new MemoryMapper();

const memory = createMemory(256 * 256);

MM.map(memory, 0, 0xffff);
MM.map(createScreenDevice(), 0x3000, 0x30ff, true);

const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(MM);

const subroutineAddress = 0x3000;
let i = 0;

const writeCharToScreen = (char, cmd, position) => {
  writableBytes[i++] = instructions.MOV_LIT_REG;
  writableBytes[i++] = cmd;
  writableBytes[i++] = char.charCodeAt(0);
  writableBytes[i++] = R1;

  writableBytes[i++] = instructions.MOV_REG_MEM;
  writableBytes[i++] = R1;
  writableBytes[i++] = 0x30;
  writableBytes[i++] = position;
};

writeCharToScreen(" ", 0xff, 0);

for (let index = 0; index <= 0xff; index++) {
  const command = index % 2 === 0 ? 0x01 : 0x02;

  writeCharToScreen("*", command, index);
}

writableBytes[i++] = instructions.HLT;

cpu.run();
