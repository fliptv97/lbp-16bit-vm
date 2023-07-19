import createMemory from "./create-memory.js";
import * as instructions from "./instructions.js";

class CPU {
  constructor(memory) {
    this.memory = memory;

    this.registerNames = ["ip", "acc", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "sp", "fp"];

    this.registers = createMemory(this.registerNames.length * 2);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      map[name] = i * 2;

      return map;
    }, {});

    this.setRegister("sp", memory.byteLength - 1 - 1);
    this.setRegister("fp", memory.byteLength - 1 - 1);

    this.stackFrameSize = 0;
  }

  debug() {
    this.registerNames.forEach((name) => {
      console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, "0")}`);
    });
    console.log();
  }

  viewMemoryAt(address, n = 8) {
    const nextNBytes = Array.from(
      {
        length: n,
      },
      (_, i) => this.memory.getUint8(address + i)
    ).map((v) => `0x${v.toString(16).padStart(2, "0")}`);

    console.log(`0x${address.toString(16).padStart(4, "0")}: ${nextNBytes.join(" ")}`);
  }

  getRegister(name) {
    if (!(name in this.registerMap)) {
      throw new Error(`getRegister: No such register '${name}'`);
    }

    return this.registers.getUint16(this.registerMap[name]);
  }

  setRegister(name, value) {
    if (!(name in this.registerMap)) {
      throw new Error(`setRegister: No such register '${name}'`);
    }

    return this.registers.setUint16(this.registerMap[name], value);
  }

  fetch() {
    const nextInstructionAddress = this.getRegister("ip");
    const instruction = this.memory.getUint8(nextInstructionAddress);

    this.setRegister("ip", nextInstructionAddress + 1);

    return instruction;
  }

  fetch16() {
    const nextInstructionAddress = this.getRegister("ip");
    const instruction = this.memory.getUint16(nextInstructionAddress);

    this.setRegister("ip", nextInstructionAddress + 2);

    return instruction;
  }

  stackPush(value) {
    const spAddress = this.getRegister("sp");

    this.memory.setUint16(spAddress, value);
    this.setRegister("sp", spAddress - 2);

    this.stackFrameSize += 2;
  }

  stackPop() {
    const nextSpAdress = this.getRegister("sp") + 2;

    this.setRegister("sp", nextSpAdress);

    this.stackFrameSize -= 2;

    return this.memory.getUint16(nextSpAdress);
  }

  stackPushState() {
    for (let i = 1; i <= 8; i++) {
      this.stackPush(this.getRegister(`r${i}`));
    }

    this.stackPush(this.getRegister("ip"));
    this.stackPush(this.stackFrameSize + 2);

    this.setRegister("fp", this.getRegister("sp"));

    this.stackFrameSize = 0;
  }

  stackPopState() {
    const framePointerAddress = this.getRegister("fp");

    this.setRegister("sp", framePointerAddress);

    this.stackFrameSize = this.stackPop();

    const stackFrameSize = this.stackFrameSize;

    this.setRegister("ip", this.stackPop());

    for (let i = 8; i >= 1; i--) {
      this.setRegister(`r${i}`, this.stackPop());
    }

    const nArgs = this.stackPop();

    for (let i = 0; i < nArgs; i++) {
      this.stackPop();
    }

    this.setRegister("fp", framePointerAddress + stackFrameSize);
  }

  fetchRegisterIndex() {
    return (this.fetch() % this.registerNames.length) * 2;
  }

  execute(instruction) {
    switch (instruction) {
      case instructions.MOV_LIT_REG: {
        const literal = this.fetch16();
        const register = this.fetchRegisterIndex();

        this.registers.setUint16(register, literal);

        return;
      }
      case instructions.MOV_REG_REG: {
        const registerFrom = this.fetchRegisterIndex();
        const registerTo = this.fetchRegisterIndex();
        const value = this.registers.getUint16(registerFrom);

        this.registers.setUint16(registerTo, value);

        return;
      }
      case instructions.MOV_REG_MEM: {
        const registerFrom = this.fetchRegisterIndex();
        const address = this.fetch16();
        const value = this.registers.getUint16(registerFrom);

        this.memory.setUint16(address, value);

        return;
      }
      case instructions.MOV_MEM_REG: {
        const address = this.fetch16();
        const registerTo = this.fetchRegisterIndex();
        const value = this.memory.getUint16(address);

        this.registers.setUint16(registerTo, value);

        return;
      }
      case instructions.ADD_REG_REG: {
        const r1 = this.fetch();
        const r2 = this.fetch();

        const r1Value = this.registers.getUint16(r1 * 2);
        const r2Value = this.registers.getUint16(r2 * 2);

        this.setRegister("acc", r1Value + r2Value);

        return;
      }
      case instructions.JMP_NOT_EQ: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value !== this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.PSH_LIT: {
        const value = this.fetch16();

        this.stackPush(value);

        return;
      }
      case instructions.PSH_REG: {
        const registerIndex = this.fetchRegisterIndex();

        this.stackPush(this.registers.getUint16(registerIndex));

        return;
      }
      case instructions.POP: {
        const registerIndex = this.fetchRegisterIndex();
        const value = this.stackPop();

        this.registers.setUint16(registerIndex, value);

        return;
      }
      case instructions.CAL_LIT: {
        const address = this.fetch16();

        this.stackPushState();
        this.setRegister("ip", address);

        return;
      }
      case instructions.CAL_REG: {
        const registerIndex = this.fetchRegisterIndex();
        const address = this.registers.getUint16(registerIndex);

        this.stackPushState();
        this.setRegister("ip", address);

        return;
      }
      case instructions.RET: {
        this.stackPopState();

        return;
      }
    }
  }

  step() {
    const instruction = this.fetch();

    return this.execute(instruction);
  }
}

export default CPU;
