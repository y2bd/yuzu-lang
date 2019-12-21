import {
  EvaluationContext,
  EvaluationResult,
  Expression
} from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export type GroupExpression = ReturnType<typeof groupExpression>;

export const groupExpression = (inner: Expression) =>
  ({
    type: "group",
    inner,
    print() {
      return `(${inner.print()})`;
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      return inner.evaluate(ctx);
    }
  } as const);

export const groupParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    const inner = parser.parseExpression();
    parser.consume("RightParen");

    return groupExpression(inner);
  }
};
