import { EvaluationContext, EvaluationResult } from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export type NameExpression = ReturnType<typeof nameExpression>;

export const nameExpression = (name: string) =>
  ({
    type: "name",
    name,
    emit() {
      return [name];
    },
    print() {
      return name;
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      if (ctx.bindings[name] == null) {
        throw new Error(`no binding could be found for name '${name}'`);
      }

      return {
        result: ctx.bindings[name],
        context: ctx
      };
    }
  } as const);

export const nameParselet: PrefixParselet = {
  parse(_: Parser, token: Token) {
    return nameExpression(token.text);
  }
};
