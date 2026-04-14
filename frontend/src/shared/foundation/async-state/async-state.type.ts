export type AsyncState<Data, ExtraVariants = never> =
  | { status: 'loading' }
  | { status: 'ready'; data: Data }
  | { status: 'error'; message: string }
  | ExtraVariants;
