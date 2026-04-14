export interface Presenter<Input, Output> {
  present(input: Input): Output;
}
