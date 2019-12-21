import {
  EvaluationContext,
  EvaluationResult,
  valueBinding
} from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";

export type StringExpression = ReturnType<typeof stringExpression>;

export const stringExpression = (str: string) =>
  ({
    type: "string",
    string: str,
    print() {
      return str;
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      return {
        result: valueBinding(str),
        context: ctx
      };
    }
  } as const);

export const stringParselet: PrefixParselet = {
  parse(_: Parser, token: Token) {
    return stringExpression(token.text);
  }
};
