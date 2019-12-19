export interface Token {
  readonly type: TokenType;
  readonly text: string;
}

export const Tokens = {
  LeftParen: "(",
  RightParen: ")",
  Comma: ",",
  Colon: ":",
  SingleQuote: "'",
  Assign: "=",
  If: "if",
  Then: "then",
  Else: "else",
  Elif: "elif",
  End: "end",
  Do: "do",
  Name: null as null,
  Numeric: null as null,
  String: null as null,
  EOF: null as null,
} as const;

export type TokenType = keyof typeof Tokens;
export type TokenLiteral = typeof Tokens[keyof typeof Tokens];
