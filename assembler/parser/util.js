export let asType = (type) => (value) => ({ type, value });

export let mapJoin = (parser) => parser.map((items) => items.join(""));
