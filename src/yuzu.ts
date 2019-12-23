import { blopParselet } from "./parselets/blopParselet";
import { callParselet } from "./parselets/callParselet";
import { doParselet } from "./parselets/doParselet";
import { evalParselet } from "./parselets/evalParselet";
import { funParselet } from "./parselets/funParselet";
import { groupParselet } from "./parselets/groupParselet";
import { ifParselet } from "./parselets/ifParselet";
import { lambdaParselet } from "./parselets/lambdaParselet";
import { nameParselet } from "./parselets/nameParselet";
import { numericalParselet } from "./parselets/numericalParselet";
import { stringParselet } from "./parselets/stringParselet";
import { EvaluationResult, Expression, valueBinding } from "./pratt/expression";
import { Lexer } from "./pratt/lexer";
import { Parser } from "./pratt/parser";
import { bropParselet } from "./parselets/bropParselet";

export function parseYuzuExpression(yuzuExpression: string) {
  const parser = getParser(yuzuExpression);

  return parser.parseExpression();
}

export function parseYuzuExpressions(yuzuFile: string) {
  const parser = getParser(yuzuFile);
  const expressions: Expression[] = [];
  try {
    while (true) {
      expressions.push(parser.parseExpression());
    }
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error("End of parsing", err);
  }
}

export function evaluateYuzuFile(yuzuFile: string) {
  const parser = getParser(yuzuFile);
  let currentResult: EvaluationResult = {
    context: {
      bindings: {}
    },
    result: valueBinding(undefined)
  };

  try {
    while (true) {
      // parse
      const nextExpression = parser.parseExpression();

      // evaluate
      currentResult = nextExpression.evaluate(currentResult.context);
    }
  } catch (err) {
    // tslint:disable-next-line:no-debugger
    debugger;
    return currentResult;
  }
}

export function evaluateYuzuExpression(
  yuzuExpression: string
): EvaluationResult {
  const parser = getParser(yuzuExpression);
  const expression = parser.parseExpression();

  return expression.evaluate({
    bindings: {}
  });
}

function getParser(yuzuExpression: string) {
  const lexer = new Lexer(yuzuExpression);
  const parser = new Parser(lexer);
  parser.register("Name", nameParselet);
  parser.register("Numeric", numericalParselet);
  parser.register("String", stringParselet);
  parser.register("LeftParen", groupParselet);
  parser.register("LeftParen", callParselet);
  parser.register("Do", doParselet);
  parser.register("If", ifParselet);
  parser.register("Fun", funParselet);
  parser.register("Backslash", lambdaParselet);
  parser.register("Blop", blopParselet);
  parser.register("Brop", bropParselet);
  parser.register("Eval", evalParselet);
  return parser;
}
