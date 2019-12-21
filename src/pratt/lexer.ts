import { Token, Tokens, TokenType } from "./token";

const isWhitespace = (char?: string) => char && char.search(/^\s/i) === 0;
const isNameCharacter = (char?: string) =>
  char && char.search(/^[\w!#$%&*+/<=>?@\\^|\-~]/i) === 0;
const isNumericCharacter = (char?: string) =>
  char && char.search(/^[0-9\.]/i) === 0;

export class Lexer {
  private readonly tokens: Record<string, string>;
  private index: number = 0;

  public constructor(private readonly text: string) {
    this.tokens = {} as Record<string, string>;
    for (const tokenType of Object.keys(Tokens) as TokenType[]) {
      const tokenLiteral = Tokens[tokenType];
      if (tokenLiteral) {
        this.tokens[tokenLiteral] = tokenType;
      }
    }
  }

  public addToken(tokenType: string, tokenLiteral: string) {
    this.tokens[tokenLiteral] = tokenType;
  }

  public nextToken(): Token {
    while (this.index < this.text.length) {
      const char = this.text[this.index++];

      // first, handle quoted strings
      // handle before symbolic tokens as we want to temporarily ignore all other tokens
      if (char === Tokens.SingleQuote) {
        return this.consumeStringUntil("SingleQuote");
      }

      // handle all other single-character tokens
      if (this.tokens[char]) {
        return {
          type: this.tokens[char] as TokenType,
          text: char
        };
      }

      // handle numerics before names
      // as numerics can have decimal points that might otherwise
      // be interpreted as dot access
      if (isNumericCharacter(char)) {
        return this.consumeNumeric();
      }

      // handle all names
      if (isNameCharacter(char)) {
        return this.consumeName();
      }

      // ignore any whitespace!!
      if (isWhitespace(char)) {
        continue;
      }

      throw new Error(`Could not parse unexpected character '${char}'`);
    }

    return {
      type: "EOF",
      text: ""
    };
  }

  public consumeStringUntil(expected: TokenType): Token {
    let until = this.index;
    let foundEndToken = false;
    let escaping = false;
    while (until < this.text.length && !foundEndToken) {
      const char = this.text[until++];
      if (char === "\\") {
        escaping = !escaping;
      }

      if (char === Tokens[expected] && !escaping) {
        foundEndToken = true;
      }

      if (escaping && char !== "\\") {
        escaping = false;
      }
    }

    if (!foundEndToken) {
      throw new Error(
        `Tried to consume until found end token ${expected} but did not find before consuming entire string`
      );
    }

    const consumed = this.text.substring(this.index, until - 1);
    this.index = until;

    return {
      type: "String",
      text: consumed
    };
  }

  public consumeNumeric(): Token {
    // cconsume as far as we can
    const start = this.index - 1;
    while (this.index < this.text.length) {
      if (!isNumericCharacter(this.text[this.index])) {
        break;
      }

      this.index++;
    }

    return {
      type: "Numeric",
      text: this.text.substring(start, this.index)
    };
  }

  public consumeName(): Token {
    // consume as far as we can
    const start = this.index - 1;
    while (this.index < this.text.length) {
      if (!isNameCharacter(this.text[this.index])) {
        break;
      }

      this.index++;
    }

    const name = this.text.substring(start, this.index);

    const matchingToken = this.tokens[name];
    if (matchingToken) {
      return {
        type: matchingToken as TokenType,
        text: name
      };
    } else {
      return {
        type: "Name",
        text: name
      };
    }
  }
}
