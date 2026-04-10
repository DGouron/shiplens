import { ChecklistItem } from '@modules/audit/entities/checklist-item/checklist-item.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

interface ChecklistItemBuilderProps {
  identifier: string;
  name: string;
  origin: string;
}

const defaultProps: ChecklistItemBuilderProps = {
  identifier: 'PM-COMMIT',
  name: 'Ecrire des messages de commit clairs',
  origin: 'packmind',
};

export class ChecklistItemBuilder extends EntityBuilder<
  ChecklistItemBuilderProps,
  ChecklistItem
> {
  constructor() {
    super(defaultProps);
  }

  withIdentifier(identifier: string): this {
    this.props.identifier = identifier;
    return this;
  }

  withName(name: string): this {
    this.props.name = name;
    return this;
  }

  withOrigin(origin: string): this {
    this.props.origin = origin;
    return this;
  }

  build(): ChecklistItem {
    return ChecklistItem.create({ ...this.props });
  }
}
