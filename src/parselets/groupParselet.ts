import { Expression } from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export const groupExpression = (inner: Expression) => ({
  type: "group",
  inner,
  print() {
    return `(${inner.print()})`;
  },
});

export const groupParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    const inner = parser.parseExpression();
    parser.consume("RightParen");

    return groupExpression(inner);
  },
};
