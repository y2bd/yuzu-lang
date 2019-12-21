import { evaluateYuzuFile } from "./yuzu";

export const yuzuExpr = `
blop(5) +(left, right)
  eval 'return this.left + this.right'
end

blop(5) -(left, right)
  eval 'return this.left - this.right'
end

blop(6) *(left, right)
  eval 'return this.left * this.right'
end

blop(3) <(left, right)
  eval 'return this.left < this.right'
end

blop(3) >(left, right)
  eval 'return this.left > this.right'
end

fun factorial(n)
  if n < 2 then
    n
  else
    n * factorial(n - 1)
  end
end

factorial(10)
`;

// tslint:disable-next-line:no-consecutive-blank-lines
// tslint:disable-next-line:no-consecutive-blank-lines
// tslint:disable-next-line:no-consecutive-blank-lines

// @ts-ignore,
const result = evaluateYuzuFile(yuzuExpr);

// tslint:disable-next-line: no-console
console.log("Done!");
