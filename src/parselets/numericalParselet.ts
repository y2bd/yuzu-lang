import {
  EvaluationContext,
  EvaluationResult,
  valueBinding
} from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export type NumericalExpression = ReturnType<typeof numericalExpression>;

export const numericalExpression = (num: string) =>
  ({
    type: "numerical",
    number: num,
    print() {
      return num;
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      return {
        result: valueBinding(Number(num)),
        context: ctx
      };
    }
  } as const);

export const numericalParselet: PrefixParselet = {
  parse(_: Parser, token: Token) {
    return numericalExpression(token.text);
  }
};
