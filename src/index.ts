import { parseYuzuExpression } from "./yuzu";

export const yuzuExpr = `
if 123 then
  foo
elif 456 then
  bar flex
else
  car
  cdr
  caddr
end
`;

// @ts-ignore
const result = parseYuzuExpression(yuzuExpr);

// tslint:disable-next-line: no-console
console.log("Done!");
