import { Expression } from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export const doExpression = (exprs: Expression[]) => ({
  type: "do",
  exprs,
  print() {
    const body = exprs.map((expr) => expr.print()).join("; ");
    return `do ${body} end`;
  },
});

export const doParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    const exprs: Expression[] = [];
    while (!parser.match("End")) {
      exprs.push(parser.parseExpression());
    }

    return doExpression(exprs);
  },
};
