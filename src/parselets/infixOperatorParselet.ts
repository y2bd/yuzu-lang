import { EvaluationContext, Expression } from "../pratt/expression";
import { InfixParselet, Parser } from "../pratt/parser";
import { Token, Tokens } from "../pratt/token";
import { resolveLate } from "./util";

export type InfixExpression = ReturnType<typeof infixExpression>;

export const infixExpression = (
  left: Expression,
  token: Token,
  right: Expression
) =>
  ({
    type: "prefix",
    left,
    operator: token,
    right,
    print() {
      return `${left.print()} ${Tokens[token.type] || token} ${right.print()}`;
    },
    emit() {
      return [
        `op_table[\`${token.text}\`](${left.emit().join('')}, ${right.emit().join('')})`,
      ]
    },
    evaluate(ctx: EvaluationContext) {
      const operatorLookup = ctx.bindings[token.type];
      if (operatorLookup == null) {
        throw new Error(
          `no definition for infix operator ${token} could be found`
        );
      }

      const operatorBinding = resolveLate(operatorLookup);

      if (operatorBinding.type !== "function") {
        throw new Error("can only use functions as infix operators");
      }

      // TODO should args have access to callee context??
      // should later args have access to prior args context??
      // bruh what does that even mean
      const argsBinding = [left, right].map(arg => arg.evaluate(ctx).result);

      return {
        context: ctx,
        result: operatorBinding.value(...argsBinding)
      };
    }
  } as const);

export const infixOperatorParselet = (precedence: number, associativity: "left" | "right" = "left"): InfixParselet => ({
  precedence,
  parse(parser: Parser, left: Expression, token: Token) {
    return infixExpression(left, token, parser.parseExpression(
      precedence - (associativity === "right" ? 1 : 0)
    ));
  }
});
