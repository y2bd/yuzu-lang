import { doParselet } from "./parselets/doParselet";
import { groupParselet } from "./parselets/groupParselet";
import { ifParselet } from "./parselets/ifParselet";
import { nameParselet } from "./parselets/nameParselet";
import { numericalParselet } from "./parselets/numericalParselet";
import { stringParselet } from "./parselets/stringParselet";
import { Lexer } from "./pratt/lexer";
import { Parser } from "./pratt/parser";

export function parseYuzuExpression(yuzuExpression: string) {
  const lexer = new Lexer(yuzuExpression);
  const parser = new Parser(lexer);

  parser.register("Name", nameParselet);
  parser.register("Numeric", numericalParselet);
  parser.register("String", stringParselet);

  parser.register("LeftParen", groupParselet);

  parser.register("Do", doParselet);
  parser.register("If", ifParselet);

  return parser.parseExpression();
}
