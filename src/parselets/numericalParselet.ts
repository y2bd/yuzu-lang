import { Parser, PrefixParselet } from "../pratt/parser";

import { Token } from "../pratt/token";

export const numericalExpression = (num: string) => ({
  type: "numerical",
  number: num,
  print() {
    return num;
  },
});

export const numericalParselet: PrefixParselet = {
  parse(_: Parser, token: Token) {
    return numericalExpression(token.text);
  },
};
