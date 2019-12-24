import {
  EvaluationContext,
  EvaluationResult,
  valueBinding
} from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";
import { StringExpression } from "./stringParselet";

export type EvalExpression = ReturnType<typeof evalExpression>;

export const evalExpression = (evalStr: string) =>
  ({
    type: "eval",
    evalStr,
    cannotBeLeftHandInInfixExpression: true,
    print() {
      return `eval '${evalStr}'`;
    },
    emit() {
      return [
        `new Function(${evalStr.replace(/this\./g, '')}).call()`,
      ]
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      const evalCtx = Object.keys(ctx.bindings).reduce(
        (actx, key) => ({
          ...actx,
          [key]: ctx.bindings[key].value
        }),
        {} as Record<string, unknown>
      );

      return {
        result: valueBinding(new Function(evalStr).call(evalCtx)),
        context: ctx
      };
    }
  } as const);

export const evalParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    const evalStr = parser.parseExpression();
    if (evalStr.type !== "string") {
      throw new Error("Can only evaluate strings");
    }

    return evalExpression((evalStr as StringExpression).string);
  }
};
