import { Binding, Expression } from "../pratt/expression";
import { Parser } from "../pratt/parser";
import { TokenType } from "../pratt/token";

export function parseUntil(parser: Parser, matches: TokenType[]) {
  const exprs: Expression[] = [];
  let lastMatched: TokenType | false = false;

  do {
    exprs.push(parser.parseExpression());
    lastMatched = parser.match(...matches);
  } while (!lastMatched);

  return { exprs, lastMatched };
}

export function resolveLate(binding: Binding): Binding {
  if (binding.type !== "late") {
    return binding;
  }

  return binding.value();
}
