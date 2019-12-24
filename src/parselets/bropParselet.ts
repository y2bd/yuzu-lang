import {
  Binding,
  EvaluationContext,
  EvaluationResult,
  Expression,
  functionBinding,
  FunctionBinding,
  lateBinding
} from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Precedence } from "../pratt/precedence";
import { Token } from "../pratt/token";
import { doExpression } from "./doParselet";
import { NameExpression, nameParselet } from "./nameParselet";
import { NumericalExpression } from "./numericalParselet";
import { parseUntil, interpose } from "./util";
import { infixOperatorParselet } from "./infixOperatorParselet";

export type BropExpression = ReturnType<typeof bropExpression>;

export interface BropArg {
  readonly name: string;
}

export const bropExpression = (
  name: string,
  precedence: number,
  args: BropArg[],
  body: Expression
) =>
  ({
    type: "brop",
    name,
    precedence,
    args,
    body,
    cannotBeLeftHandInInfixExpression: true,
    print() {
      const argStr = args.map(arg => arg.name).join(", ");
      return `brop(${precedence}) ${name}(${argStr}) ${body.print()} end`;
    },
    emit() {
      return [
        `(op_table = op_table || {})[\`${name}\`] = (`,
        ...interpose(args.map(arg => arg.name), ",\n"),
        `) => {\n`,
        ...body.emit(),
        `}\n`
      ]
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      const result = ((): FunctionBinding => {
        const recursiveContext: EvaluationContext = {
          ...ctx,
          bindings: {
            ...ctx.bindings,
            [name]: lateBinding(() => result)
          }
        };

        return functionBinding((...fargs: Binding[]): Binding => {
          if (fargs.length > 2) {
            throw new Error(
              "binary operators can only be called with two arguments"
            );
          }

          const innerContext: EvaluationContext = {
            ...recursiveContext,
            // TODO throw error on shadow?
            // TODO wtf difference between parameter and argument
            bindings: fargs.reduce((actx, farg, i) => {
              const argName = args[i].name;
              const argVal = farg;
              return {
                ...actx,
                [argName]: argVal
              };
            }, recursiveContext.bindings)
          };

          // We discard any built-up context withih the body
          // as it doesn't exist outside of it
          return body.evaluate(innerContext).result;
        }, 2);
      })();

      return {
        result,
        context: {
          ...ctx,
          bindings: {
            ...ctx.bindings,
            [name]: result
          }
        }
      };
    }
  } as const);

export const bropParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    parser.consume("LeftParen");

    const precedenceExpr = parser.parseExpression();
    if (precedenceExpr.type !== "numerical") {
      throw new Error("all precedence values need to be numerical literals");
    }
    const precedence = Number((precedenceExpr as NumericalExpression).number);

    parser.consume("RightParen");

    // We need to make sure the call doesn't bind instead
    // Keep us at the same level
    const name = parser.parseExpression(Precedence.Call);
    if (name.type !== "name") {
      throw new Error("all operator names need to be valid names");
    }

    parser.consume("LeftParen");

    const args: BropArg[] = [];
    while (!parser.match("RightParen")) {
      if (args.length >= 2) {
        throw new Error("binary operators can only have two arguments");
      }

      const arg = parser.parseExpression();
      if (arg.type !== "name") {
        throw new Error("all argument names need to be valid names");
      }

      args.push({
        name: (arg as NameExpression).name
      });

      parser.match("Comma");
    }

    // add the newly defined operator to the parser
    // TODO what if the body fails to parse?
    parser.registerRuntimeInfix(
      (name as NameExpression).name,
      infixOperatorParselet(precedence, "right"),
      // by doing this, the user can also use infix operators
      // as functions
      nameParselet
    )

    let bodyExprs: Expression[];
    ({ exprs: bodyExprs } = parseUntil(parser, ["End"]));

    return bropExpression(
      (name as NameExpression).name,
      precedence,
      args,
      doExpression(bodyExprs)
    );
  }
};
