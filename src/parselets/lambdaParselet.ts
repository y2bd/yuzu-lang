import {
  Binding,
  EvaluationContext,
  EvaluationResult,
  Expression,
  functionBinding
} from "../pratt/expression";
import { Parser, PrefixParselet } from "../pratt/parser";
import { Token } from "../pratt/token";
import { doExpression } from "./doParselet";
import { NameExpression } from "./nameParselet";
import { parseUntil } from "./util";

export type LambdaExpression = ReturnType<typeof lambdaExpression>;

export interface LambdaArg {
  readonly name: string;
}

export const lambdaExpression = (args: LambdaArg[], body: Expression) =>
  ({
    type: "lambda",
    args,
    body,
    cannotBeLeftHandInInfixExpression: true,
    print() {
      const argStr = args.map(arg => arg.name).join(", ");
      return `\(${argStr}) ${body.print()} end`;
    },
    evaluate(ctx: EvaluationContext): EvaluationResult {
      return {
        result: functionBinding((...fargs: Binding[]): Binding => {
          const innerContext: EvaluationContext = {
            // TODO throw error on shadow?
            // TODO wtf difference between parameter and argument
            bindings: fargs.reduce((actx, farg, i) => {
              const argName = args[i].name;
              const argVal = farg;
              return {
                ...actx,
                [argName]: argVal
              };
            }, ctx.bindings)
          };

          // We discard any built-up context withih the body
          // as it doesn't exist outside of it
          return body.evaluate(innerContext).result;
        }, args.length),
        context: ctx
      };
    }
  } as const);

export const lambdaParselet: PrefixParselet = {
  parse(parser: Parser, _: Token) {
    parser.consume("LeftParen");

    const args: LambdaArg[] = [];
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

    return lambdaExpression(args, doExpression(bodyExprs));
  }
};
