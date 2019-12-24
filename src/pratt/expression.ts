export interface Expression {
  readonly type: string;
  readonly cannotBeLeftHandInInfixExpression?: boolean;
  emit(): string[];
  print(): string;
  evaluate(context: EvaluationContext): EvaluationResult;
}

export interface EvaluationContext {
  readonly bindings: Bindings;
}

export type Bindings = Readonly<Record<string, Binding>>;

export interface EvaluationResult {
  readonly result: Binding;
  readonly context: EvaluationContext;
}

export type Binding = ValueBinding | FunctionBinding | LateBinding;

export interface ValueBinding {
  readonly type: "value";
  readonly value: unknown;
}

export const valueBinding = (value: unknown): ValueBinding => ({
  value,
  type: "value"
});

export interface FunctionBinding {
  readonly type: "function";
  readonly argumentCount: number;
  readonly value: (...args: Binding[]) => Binding;
}

export const functionBinding = (
  value: FunctionBinding["value"],
  argumentCount: number
): FunctionBinding => ({
  value,
  argumentCount,
  type: "function"
});

export interface LateBinding {
  readonly type: "late";
  readonly value: () => Binding;
}

export const lateBinding = (value: LateBinding["value"]): LateBinding => ({
  value,
  type: "late"
});
