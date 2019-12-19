import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export const stringExpression = (str: string) => ({
  type: "string",
  string: str,
  print() {
    return str;
  },
});

export const stringParselet: PrefixParselet = {
  parse(_: Parser, token: Token) {
    return stringExpression(token.text);
  },
};
