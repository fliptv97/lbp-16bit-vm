let createMemory = (sizeInBytes) => {
  let ab = new ArrayBuffer(sizeInBytes);

  return new DataView(ab);
};

export default createMemory;
