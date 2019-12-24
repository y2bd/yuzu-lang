import {
  EvaluationContext,
  EvaluationResult,
  Expression
} from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token, TokenType } from "../pratt/token";
import { doExpression } from "./doParselet";
import { parseUntil } from "./util";

export type IfExpression = ReturnType<typeof ifExpression>;

export interface IfClause {
  readonly condition: Expression;
  readonly body: Expression;
}

export interface ElseClause {
  readonly body: Expression;
}

export const ifExpression = (ifClauses: IfClause[], elseClause: ElseClause) =>
  ({
    type: "if",
    ifClauses,
    elseClause,
    print() {
      const [ifClause, ...elifClauses] = ifClauses;

      const ifStr = `if ${ifClause.condition.print()} then ${ifClause.body.print()}`;
      const elifStr = elifClauses
        .map(ec => `elif ${ec.condition.print()} then ${ec.body.print()}`)
        .join(" ");
      const elseStr = `else ${elseClause.body.print()} end`;

      return `${ifStr} ${elifStr} ${elseStr}`;
    },
    emit() {
      throw new Error("Not yet implemented");
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      for (const ifClause of ifClauses) {
        const cond = ifClause.condition.evaluate(ctx);

        // TODO lmao who needs a type system
        if (!!cond.result.value) {
          // make sure to pass the /condition/s context
          // in case bindings were introduced within
          return ifClause.body.evaluate(cond.context);
        }
      }

      return elseClause.body.evaluate(ctx);
    }
  } as const);

export const ifParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    const ifClauses: IfClause[] = [];

    // parse initial if
    const ifCond = parser.parseExpression();
    parser.consume("Then");

    let lastMatched: TokenType | false = false;
    let ifBodyExprs: Expression[];

    ({ exprs: ifBodyExprs, lastMatched } = parseUntil(parser, [
      "Elif",
      "Else"
    ]));

    ifClauses.push({
      condition: ifCond,
      body: doExpression(ifBodyExprs)
    });

    // then consume all elifs
    while (lastMatched === "Elif") {
      const elifCond = parser.parseExpression();
      parser.consume("Then");

      let elifBodyExprs: Expression[] = [];
      ({ exprs: elifBodyExprs, lastMatched } = parseUntil(parser, [
        "Elif",
        "Else"
      ]));

      ifClauses.push({
        condition: elifCond,
        body: doExpression(elifBodyExprs)
      });
    }

    // and last finish the else
    let elseBodyExprs: Expression[] = [];
    ({ exprs: elseBodyExprs, lastMatched } = parseUntil(parser, ["End"]));

    const elseClause: ElseClause = {
      body: doExpression(elseBodyExprs)
    };

    return ifExpression(ifClauses, elseClause);
  }
};
