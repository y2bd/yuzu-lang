import { Expression } from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token, Tokens, TokenType } from "../pratt/token";

export const prefixExpression = (operator: TokenType, operand: Expression) => ({
  type: "prefix",
  operator,
  operand,
  print() {
    return `${Tokens[operator]} ${operand.print()}`;
  },
});

export const prefixOperatorParselet: PrefixParselet = {
  parse(parser: Parser, token: Token) {
    return prefixExpression(token.type, parser.parseExpression());
  },
};
