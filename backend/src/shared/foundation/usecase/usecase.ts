export interface Usecase<Params = void, Result = void> {
  execute(params: Params): Promise<Result>;
}
