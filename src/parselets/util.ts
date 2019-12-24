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

export function indent(str: string, amount?: number): string;
export function indent(str: string[], amount?: number): string[];
export function indent(str: string | string[], amount: number = 1): string | string[] {
  if (Array.isArray(str)) {
    return str.map(s => indent(s, amount));
  }

  let padding = "";
  while (amount > 0) {
    padding += "  ";
    amount--;
  }

  return `${padding}${str}`;
}

export function flat(strs: string[], joiner: string = " "): string {
  return strs.join(joiner);
}

export function flatMap<T, U>(xs: T[], fn: (x: T, i: number, arr: T[]) => U[]): U[] {
  return ([] as U[]).concat(...xs.map(fn));
}

export function interpose<T>(xs: T[], elem: T): T[] {
  return flatMap(xs, (x, i) => i < xs.length - 1 ? [x, elem] : [x]);
}