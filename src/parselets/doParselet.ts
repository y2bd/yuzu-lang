import { EvaluationContext, EvaluationResult, Expression } from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";
import { toss } from "../util";
import { flatMap } from "./util";

export type DoExpression = ReturnType<typeof doExpression>;

export const doExpression = (exprs: Expression[]) =>
  ({
    type: "do",
    exprs,
    print() {
      const body = exprs.map(expr => expr.print()).join("; ");
      return `do ${body} end`;
    },
    emit() {
      return [
        `(() => {\n`,
        ...flatMap(exprs, (expr, i) => i < exprs.length - 1 ? [...expr.emit(), ";\n"] : [`return`, ...expr.emit(), ";\n"]),
        `})();\n`
      ];
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      let lastResult: EvaluationResult | undefined;
      for (const expr of exprs) {
        lastResult = expr.evaluate(lastResult?.context ?? ctx);
      }

      if (!lastResult) {
        throw new Error("do block cannot be empty");
      }

      return lastResult
        ? // We actually discard inner context
        // Since we're outside now
        { ...lastResult, context: ctx }
        : toss(new Error("do block cannot be empty"));
    }
  } as const);

export const doParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    const exprs: Expression[] = [];
    while (!parser.match("End")) {
      exprs.push(parser.parseExpression());
    }

    return doExpression(exprs);
  }
};
