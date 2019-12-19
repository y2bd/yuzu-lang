import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export const nameExpression = (name: string) => ({
  type: "name",
  name,
  print() {
    return name;
  },
});

export const nameParselet: PrefixParselet = {
  parse(_: Parser, token: Token) {
    return nameExpression(token.text);
  },
};
