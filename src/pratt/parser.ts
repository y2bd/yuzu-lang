import { Expression } from "./expression";
import { Lexer } from "./lexer";
import { Token, TokenType } from "./token";

export interface PrefixParselet {
  parse(parser: Parser, token: Token): Expression;
}

export interface InfixParselet {
  readonly precedence: number;
  parse(parser: Parser, left: Expression, token: Token): Expression;
}

const isInfixParselet = (
  parselet: PrefixParselet | InfixParselet,
): parselet is InfixParselet =>
  (parselet as InfixParselet).precedence !== undefined;

export class Parser {
  private readonly read: Token[];
  private readonly prefixParselets: Record<TokenType, PrefixParselet>;
  private readonly infixParselets: Record<TokenType, InfixParselet>;

  public constructor(private readonly lexer: Lexer) {
    this.read = [];
    this.prefixParselets = {} as any;
    this.infixParselets = {} as any;
  }

  /**
   * Registers a parselet for a specific token type.
   */
  public register(
    tokenType: TokenType,
    parselet: PrefixParselet | InfixParselet,
  ) {
    if (isInfixParselet(parselet)) {
      this.registerInfix(tokenType, parselet);
    } else {
      this.registerPrefix(tokenType, parselet);
    }
  }

  public registerPrefix(tokenKey: TokenType, parselet: PrefixParselet) {
    this.prefixParselets[tokenKey] = parselet;
  }

  public registerInfix(tokenKey: TokenType, parselet: InfixParselet) {
    this.infixParselets[tokenKey] = parselet;
  }

  /**
   * Parse the next complete expression according to the Pratt Parser algorithm.
   * https://en.wikipedia.org/wiki/Pratt_parser
   *
   * @param precedence Optionally, a precedence at which to parse the next available expression.
   * Affects the binding power of infix expressions.
   */
  public parseExpression(precedence: number = 0) {
    // consume a token off the lexer's token queue
    let token = this.consume();

    // find a matching standalone (i.e. prefix) parselet for the currently available token
    const prefix = this.prefixParselets[token.type];
    if (!prefix) {
      throw new Error(
        `Tried to parse ${token.type} with prefix parselet but none was found`,
      );
    }

    // use that parselet to parse the current token
    // note that parselets get access to the full parser
    // and may internally consume as many tokens as they wish
    let left = prefix.parse(this, token);

    // check to see if there is an upcoming token with available infix parselet
    // and that that infix parselet has a higher precedence than the current expression
    // and therefore should be parsed immediately before returning
    //
    // for example, assume we are parsing the code below and are at the `5`:
    //          3 + 5 * 4
    //          ----^
    // before returning the `5`, we look ahead and see the upcoming `* 4`.
    // we know that `*` has higher precedence than `+`, and therefore we can't just stop and return `5`.
    // instead, we need to parse and return `5 * 4`.
    while (precedence < this._upcomingPrecedence()) {
      token = this.consume();

      const infix = this.infixParselets[token.type];
      if (!infix) {
        throw new Error(
          `Tried to parse ${token.type} with infix parselet but none was found`,
        );
      }

      // use the infix parselet to parse the current token, given the existing expression to the left of it
      // again, remember that parselets get access to the full parser
      // and may internally consume as many tokens as they wish
      left = infix.parse(this, left, token);
    }

    return left;
  }

  /**
   * Essentially a tryConsume(). If the next token matches any of the expected, we consume it
   * and return the consumed TokenType. Otherwise we leave the token queue alone and return false.
   * @param expected the token to try and consume
   */
  public match(...expecteds: TokenType[]): TokenType | false {
    const token = this._lookAhead(0);
    if (!expecteds.includes(token.type)) {
      return false;
    }

    this.consume();
    return token.type;
  }

  /**
   * Consumes the next token from the queue. If provided with a specific token to look for,
   * it will assert that the next token matches, and throws otherwise.
   * @param expected the token to try and consume.
   */
  public consume(expected?: TokenType): Token {
    if (expected) {
      const token = this._lookAhead(0);
      if (token.type !== expected) {
        throw new Error(
          `Expected token ${expected}, but instead found ${token.type}`,
        );
      }

      return this.consume();
    } else {
      // make sure we've at least read a token
      this._lookAhead(0);
      return this.read.shift()!;
    }
  }

  private _lookAhead(distance: number): Token {
    while (distance >= this.read.length) {
      this.read.push(this.lexer.nextToken());
    }

    return this.read[distance];
  }

  /**
   * Peeks ahead into the token queue and sees if the next available token
   * has a matching infix parselet.
   * if so, return its precedence.
   */
  private _upcomingPrecedence() {
    const parser = this.infixParselets[this._lookAhead(0).type];
    if (parser) {
      return parser.precedence;
    } else {
      return 0;
    }
  }
}
