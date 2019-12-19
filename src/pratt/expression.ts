export interface Expression {
  readonly type: string;
  print(): string;
}
