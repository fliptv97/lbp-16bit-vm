import { meta } from "./meta.js";

let indexBy = (prop, arr) =>
  arr.reduce((output, item) => {
    output[item[prop]] = item;

    return output;
  }, {});

let instructions = indexBy("instruction", meta);

export default instructions;
