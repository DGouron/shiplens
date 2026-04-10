export abstract class EntityBuilder<Props, Entity> {
  protected props: Props;

  constructor(defaultProps: Props) {
    this.props = { ...defaultProps };
  }

  abstract build(): Entity;

  buildMany(count: number): Entity[] {
    return Array.from({ length: count }, () => this.build());
  }
}
