import { Expression } from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token, TokenType } from "../pratt/token";
import { doExpression } from "./doParselet";

export interface IfClause {
  readonly condition: Expression;
  readonly body: Expression;
}

export interface ElseClause {
  readonly body: Expression;
}

export const ifExpression = (
  ifClauses: IfClause[],
  elseClause: ElseClause,
) => ({
  type: "if",
  ifClauses,
  elseClause,
  print() {
    const [ifClause, ...elifClauses] = ifClauses;

    const ifStr = `if ${ifClause.condition.print()} then ${ifClause.body.print()}`;
    const elifStr = elifClauses
      .map((ec) => `elif ${ec.condition.print()} then ${ec.body.print()}`)
      .join(" ");
    const elseStr = `else ${elseClause.body.print()} end`;

    return `${ifStr} ${elifStr} ${elseStr}`;
  },
});

export const ifParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    const ifClauses: IfClause[] = [];

    // parse initial if
    const ifCond = parser.parseExpression();
    parser.consume("Then");

    let lastMatched: TokenType | false;

    const ifBodyExprs: Expression[] = [];
    do {
      ifBodyExprs.push(parser.parseExpression());
      lastMatched = parser.match("Elif", "Else");
    } while (!lastMatched);

    ifClauses.push({
      condition: ifCond,
      body: doExpression(ifBodyExprs),
    });

    // then consume all elifs
    while (lastMatched === "Elif") {
      const elifCond = parser.parseExpression();
      parser.consume("Then");

      const elifBodyExprs: Expression[] = [];
      do {
        elifBodyExprs.push(parser.parseExpression());
        lastMatched = parser.match("Elif", "Else");
      } while (!lastMatched);

      ifClauses.push({
        condition: elifCond,
        body: doExpression(elifBodyExprs),
      });
    }

    // and last finish the else
    const elseBodyExprs: Expression[] = [];
    do {
      elseBodyExprs.push(parser.parseExpression());
      lastMatched = parser.match("End", "Else");
    } while (!lastMatched);

    const elseClause: ElseClause = {
      body: doExpression(elseBodyExprs),
    };

    return ifExpression(ifClauses, elseClause);
  },
};
