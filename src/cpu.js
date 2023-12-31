import createMemory from "./create-memory.js";
import instructions from "./instructions/index.js";
import registers from "./registers.js";

class CPU {
  constructor(memory, interruptVectorAddress = 0x1000) {
    this.memory = memory;
    this.registers = createMemory(registers.length * 2);
    this.registerMap = registers.reduce((map, name, i) => {
      map[name] = i * 2;

      return map;
    }, {});

    this.interruptVectorAddress = interruptVectorAddress;
    this.isInInterruptHandler = false;

    this.setRegister("im", 0xffff);
    this.setRegister("sp", 0xffff - 1);
    this.setRegister("fp", 0xffff - 1);

    this.stackFrameSize = 0;
  }

  debug() {
    registers.forEach((name) => {
      console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, "0")}`);
    });
    console.log();
  }

  viewMemoryAt(address, n = 8) {
    let nextNBytes = Array.from(
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
    let nextInstructionAddress = this.getRegister("ip");
    let instruction = this.memory.getUint8(nextInstructionAddress);

    this.setRegister("ip", nextInstructionAddress + 1);

    return instruction;
  }

  fetch16() {
    let nextInstructionAddress = this.getRegister("ip");
    let instruction = this.memory.getUint16(nextInstructionAddress);

    this.setRegister("ip", nextInstructionAddress + 2);

    return instruction;
  }

  stackPush(value) {
    let spAddress = this.getRegister("sp");

    this.memory.setUint16(spAddress, value);
    this.setRegister("sp", spAddress - 2);

    this.stackFrameSize += 2;
  }

  stackPop() {
    let nextSpAdress = this.getRegister("sp") + 2;

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
    let framePointerAddress = this.getRegister("fp");

    this.setRegister("sp", framePointerAddress);

    this.stackFrameSize = this.stackPop();

    let stackFrameSize = this.stackFrameSize;

    this.setRegister("ip", this.stackPop());

    for (let i = 8; i >= 1; i--) {
      this.setRegister(`r${i}`, this.stackPop());
    }

    let nArgs = this.stackPop();

    for (let i = 0; i < nArgs; i++) {
      this.stackPop();
    }

    this.setRegister("fp", framePointerAddress + stackFrameSize);
  }

  fetchRegisterIndex() {
    return (this.fetch() % registers.length) * 2;
  }

  handleInterrupt(value) {
    let interruptVectorIndex = value % 0xf;
    let isUnmasked = Boolean((1 << interruptVectorIndex) & this.getRegister("im"));

    if (!isUnmasked) return;

    let addressPointer = this.interruptVectorAddress + interruptVectorIndex * 2;
    let address = this.memory.getUint16(addressPointer);

    if (!this.isInInterruptHandler) {
      this.stackPush(0);
      this.stackPushState();
    }

    this.isInInterruptHandler = true;

    this.setRegister("ip", address);
  }

  execute(instruction) {
    switch (instruction) {
      case instructions.INT.opcode: {
        let interruptValue = this.fetch16();

        this.handleInterrupt(interruptValue);

        return;
      }

      case instructions.RET_INT.opcode: {
        this.isInInterruptHandler = false;

        this.popState();

        return;
      }

      case instructions.MOV_LIT_REG.opcode: {
        let literal = this.fetch16();
        let register = this.fetchRegisterIndex();

        this.registers.setUint16(register, literal);

        return;
      }
      case instructions.MOV_REG_REG.opcode: {
        let registerFrom = this.fetchRegisterIndex();
        let registerTo = this.fetchRegisterIndex();
        let value = this.registers.getUint16(registerFrom);

        this.registers.setUint16(registerTo, value);

        return;
      }
      case instructions.MOV_REG_MEM.opcode: {
        let registerFrom = this.fetchRegisterIndex();
        let address = this.fetch16();
        let value = this.registers.getUint16(registerFrom);

        this.memory.setUint16(address, value);

        return;
      }
      case instructions.MOV_MEM_REG.opcode: {
        let address = this.fetch16();
        let registerTo = this.fetchRegisterIndex();
        let value = this.memory.getUint16(address);

        this.registers.setUint16(registerTo, value);

        return;
      }
      case instructions.MOV_LIT_MEM.opcode: {
        let value = this.fetch16();
        let address = this.fetch16();

        this.memory.setUint16(address, value);

        return;
      }
      case instructions.MOV_REG_PTR_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let ptr = this.registers.getUint16(r1);
        let value = this.memory.getUint16(ptr);

        this.registers.setUint16(r2, value);

        return;
      }
      case instructions.MOV_LIT_OFF_REG.opcode: {
        let baseAddress = this.fetch16();
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let offset = this.registers.getUint16(r1);
        let value = this.memory.getUint16(baseAddress + offset);

        this.registers.setUint16(r2, value);

        return;
      }
      case instructions.ADD_LIT_REG.opcode: {
        let value = this.fetch16();
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);

        this.setRegister("acc", value + registerValue);

        return;
      }
      case instructions.ADD_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();

        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.setRegister("acc", r1Value + r2Value);

        return;
      }
      case instructions.SUB_LIT_REG.opcode: {
        let value = this.fetch16();
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);

        this.setRegister("acc", registerValue - value);

        return;
      }
      case instructions.SUB_REG_LIT.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);
        let value = this.fetch16();

        this.setRegister("acc", registerValue - value);

        return;
      }
      case instructions.SUB_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.setRegister("acc", r1Value - r2Value);

        return;
      }
      case instructions.MUL_LIT_REG.opcode: {
        let value = this.fetch16();
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);

        this.setRegister("acc", registerValue * value);

        return;
      }
      case instructions.MUL_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.setRegister("acc", r1Value * r2Value);

        return;
      }
      case instructions.INC_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);

        this.registers.setUint16(register, registerValue + 1);

        return;
      }
      case instructions.DEC_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);

        this.registers.setUint16(register, registerValue - 1);

        return;
      }
      case instructions.LSF_REG_LIT.opcode: {
        let register = this.fetchRegisterIndex();
        // Why do we fetch instead of fetch16?
        let literal = this.fetch();
        let registerValue = this.registers.getUint16(register);

        this.registers.setUint16(register, registerValue << literal);

        return;
      }
      case instructions.LSF_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.registers.setUint16(r1, r1Value << r2Value);

        return;
      }
      case instructions.RSF_REG_LIT.opcode: {
        let register = this.fetchRegisterIndex();
        // Why do we fetch instead of fetch16?
        let literal = this.fetch();
        let registerValue = this.registers.getUint16(register);

        this.registers.setUint16(register, registerValue >> literal);

        return;
      }
      case instructions.RSF_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.registers.setUint16(r1, r1Value >> r2Value);

        return;
      }
      case instructions.AND_REG_LIT.opcode: {
        let register = this.fetchRegisterIndex();
        let literal = this.fetch16();
        let registerValue = this.registers.getUint16(register);

        this.setRegister("acc", registerValue & literal);

        return;
      }
      case instructions.AND_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.setRegister("acc", r1Value & r2Value);

        return;
      }
      case instructions.OR_REG_LIT.opcode: {
        let register = this.fetchRegisterIndex();
        let literal = this.fetch16();
        let registerValue = this.registers.getUint16(register);

        this.setRegister("acc", registerValue | literal);

        return;
      }
      case instructions.OR_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.setRegister("acc", r1Value | r2Value);

        return;
      }
      case instructions.XOR_REG_LIT.opcode: {
        let register = this.fetchRegisterIndex();
        let literal = this.fetch16();
        let registerValue = this.registers.getUint16(register);

        this.setRegister("acc", registerValue ^ literal);

        return;
      }
      case instructions.XOR_REG_REG.opcode: {
        let r1 = this.fetchRegisterIndex();
        let r2 = this.fetchRegisterIndex();
        let r1Value = this.registers.getUint16(r1);
        let r2Value = this.registers.getUint16(r2);

        this.setRegister("acc", r1Value ^ r2Value);

        return;
      }
      case instructions.NOT.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);

        let result = ~registerValue & 0xffff;

        this.setRegister("acc", result);

        return;
      }
      case instructions.JEQ_LIT.opcode: {
        let value = this.fetch16();
        let address = this.fetch16();

        if (value === this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JEQ_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);
        let address = this.fetch16();

        if (registerValue === this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JNE_LIT.opcode: {
        let value = this.fetch16();
        let address = this.fetch16();

        if (value !== this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JNE_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);
        let address = this.fetch16();

        if (registerValue !== this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JLT_LIT.opcode: {
        let value = this.fetch16();
        let address = this.fetch16();

        if (value < this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JLT_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);
        let address = this.fetch16();

        if (registerValue < this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JGT_LIT.opcode: {
        let value = this.fetch16();
        let address = this.fetch16();

        if (value > this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JGT_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);
        let address = this.fetch16();

        if (registerValue > this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JLE_LIT.opcode: {
        let value = this.fetch16();
        let address = this.fetch16();

        if (value <= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JLE_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);
        let address = this.fetch16();

        if (registerValue <= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JGE_LIT.opcode: {
        let value = this.fetch16();
        let address = this.fetch16();

        if (value >= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.JGE_REG.opcode: {
        let register = this.fetchRegisterIndex();
        let registerValue = this.registers.getUint16(register);
        let address = this.fetch16();

        if (registerValue >= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }

        return;
      }
      case instructions.PSH_LIT.opcode: {
        let value = this.fetch16();

        this.stackPush(value);

        return;
      }
      case instructions.PSH_REG.opcode: {
        let registerIndex = this.fetchRegisterIndex();

        this.stackPush(this.registers.getUint16(registerIndex));

        return;
      }
      case instructions.POP.opcode: {
        let registerIndex = this.fetchRegisterIndex();
        let value = this.stackPop();

        this.registers.setUint16(registerIndex, value);

        return;
      }
      case instructions.CAL_LIT.opcode: {
        let address = this.fetch16();

        this.stackPushState();
        this.setRegister("ip", address);

        return;
      }
      case instructions.CAL_REG.opcode: {
        let registerIndex = this.fetchRegisterIndex();
        let address = this.registers.getUint16(registerIndex);

        this.stackPushState();
        this.setRegister("ip", address);

        return;
      }
      case instructions.RET.opcode: {
        this.stackPopState();

        return;
      }
      case instructions.HLT.opcode: {
        return true;
      }
    }
  }

  step() {
    let instruction = this.fetch();

    return this.execute(instruction);
  }

  run() {
    let halt = this.step();

    if (!halt) {
      setImmediate(() => this.run());
    }
  }
}

export default CPU;
