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
import { NameExpression } from "./nameParselet";
import { parseUntil } from "./util";

export type FunExpression = ReturnType<typeof funExpression>;

export interface FunArg {
  readonly name: string;
}

export const funExpression = (name: string, args: FunArg[], body: Expression) =>
  ({
    type: "fun",
    name,
    args,
    body,
    cannotBeLeftHandInInfixExpression: true,
    print() {
      const argStr = args.map(arg => arg.name).join(", ");
      return `fun ${name}(${argStr}) ${body.print()} end`;
    },
    emit() {
      throw new Error("Not yet implemented");
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
        }, args.length);
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

export const funParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    // We need to make sure the call doesn't bind instead
    // Keep us at the same level
    const name = parser.parseExpression(Precedence.Call);
    if (name.type !== "name") {
      throw new Error("all function names need to be valid names");
    }

    parser.consume("LeftParen");

    const args: FunArg[] = [];
    while (!parser.match("RightParen")) {
      const arg = parser.parseExpression();
      if (arg.type !== "name") {
        throw new Error("all argument names need to be valid names");
      }

      args.push({
        name: (arg as NameExpression).name
      });

      parser.match("Comma");
    }

    let bodyExprs: Expression[];
    ({ exprs: bodyExprs } = parseUntil(parser, ["End"]));

    return funExpression(
      (name as NameExpression).name,
      args,
      doExpression(bodyExprs)
    );
  }
};
