import { Binding, EvaluationContext, EvaluationResult, Expression, functionBinding } from "../pratt/expression";
import { InfixParselet, Parser } from "../pratt/parser";
import { Precedence } from "../pratt/precedence";
import { Token } from "../pratt/token";
import { flatMap, resolveLate } from "./util";

export const callExpression = (callee: Expression, args: Expression[]) => ({
  type: "call",
  callee,
  args,
  print() {
    const calleeStr = callee.print();
    const argStr = args.map(arg => arg.print()).join(", ");

    return `${calleeStr}(${argStr})`;
  },
  emit() {
    return [
      `(${callee.emit().join})(${args.map((arg) => arg.emit().join('')).join(', ')})`,
    ]
  },
  evaluate(ctx: EvaluationContext): EvaluationResult {
    const calleeRes = callee.evaluate(ctx);
    const calleeBinding = resolveLate(calleeRes.result);

    if (calleeBinding.type !== "function") {
      throw new Error("can only call a function expression");
    }

    // TODO should args have access to callee context??
    // should later args have access to prior args context??
    // bruh what does that even mean
    const argsBinding = args.map(arg => arg.evaluate(ctx).result);

    // partial application handled!!
    const argsCount = argsBinding.length;
    if (argsCount < calleeBinding.argumentCount) {
      return {
        context: ctx,
        result: functionBinding(
          (...restArgs: Binding[]) =>
            calleeBinding.value(...argsBinding, ...restArgs),
          calleeBinding.argumentCount - argsCount
        )
      };
    }

    return {
      context: ctx,
      result: calleeBinding.value(...argsBinding)
    };
  }
});

export const callParselet: InfixParselet = {
  precedence: Precedence.Call,
  parse(parser: Parser, callee: Expression, _: Token) {
    const args: Expression[] = [];
    while (!parser.match("RightParen")) {
      args.push(parser.parseExpression());
      parser.match("Comma");
    }

    return callExpression(callee, args);
  }
};
