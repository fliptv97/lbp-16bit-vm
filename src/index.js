import CPU from "./cpu.js";
import createMemory from "./create-memory.js";
import MemoryMapper from "./memory-mapper.js";

let MM = new MemoryMapper();

let createBankedMemory = (n, size, cpu) => {
  let banks = Array.from({ length: n }, () => createMemory(size));

  const forwardToDataView =
    (name) =>
    (...args) => {
      let bankIndex = cpu.getRegister("mb") % n;
      let bank = banks[bankIndex];

      return bank[name](...args);
    };

  return ["getUint8", "getUint16", "setUint8", "setUint16"].reduce((interface_, fnName) => {
    interface_[fnName] = forwardToDataView(fnName);

    return interface_;
  }, {});
};

const BANK_SIZE = 0xff; // 255
const BANKS_COUNT = 8;

let cpu = new CPU(MM);

let memoryBankDevice = createBankedMemory(BANKS_COUNT, BANK_SIZE, cpu);
let regularMemory = createMemory(0xff00); // 65280

MM.map(memoryBankDevice, 0, BANK_SIZE);
MM.map(regularMemory, BANK_SIZE, 0xffff, true);
