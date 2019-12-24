import { EvaluationContext, Expression } from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token, Tokens, TokenType } from "../pratt/token";

export type PrefixExpression = ReturnType<typeof prefixExpression>;

export const prefixExpression = (operator: TokenType, operand: Expression) =>
  ({
    type: "prefix",
    operator,
    operand,
    emit() {
      throw new Error("Not yet implemented");
    },
    print() {
      return `${Tokens[operator]} ${operand.print()}`;
    },
    evaluate(_: EvaluationContext) {
      throw new Error("Not yet implemented");
    }
  } as const);

export const prefixOperatorParselet: PrefixParselet = {
  parse(parser: Parser, token: Token) {
    return prefixExpression(token.type, parser.parseExpression());
  }
};
