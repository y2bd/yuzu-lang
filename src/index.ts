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

blop(3) ==(left, right)
  eval 'return this.left === this.right'
end

brop(6) ^(left, right)
  if right > 1 then
    left * (left ^ (right - 1))
  elif right == 1 then
    left
  else
    1
  end
end

3 ^ 2 ^ 3
`;

// tslint:disable-next-line:no-consecutive-blank-lines
// tslint:disable-next-line:no-consecutive-blank-lines
// tslint:disable-next-line:no-consecutive-blank-lines

// @ts-ignore,
const result = evaluateYuzuFile(yuzuExpr);

// tslint:disable-next-line: no-console
console.log("Done!");
