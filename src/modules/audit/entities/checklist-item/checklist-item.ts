import {
  MissingChecklistItemIdentifierError,
  MissingChecklistItemNameError,
} from './checklist-item.errors.js';

interface ChecklistItemProps {
  identifier: string;
  name: string;
  origin: string;
}

interface CreateChecklistItemInput {
  identifier: string;
  name: string;
  origin: string;
}

export class ChecklistItem {
  private constructor(private readonly props: ChecklistItemProps) {}

  static create(input: CreateChecklistItemInput): ChecklistItem {
    if (input.identifier.trim() === '') {
      throw new MissingChecklistItemIdentifierError();
    }

    if (input.name.trim() === '') {
      throw new MissingChecklistItemNameError();
    }

    return new ChecklistItem({
      identifier: input.identifier,
      name: input.name,
      origin: input.origin,
    });
  }

  get identifier(): string {
    return this.props.identifier;
  }

  get name(): string {
    return this.props.name;
  }

  get origin(): string {
    return this.props.origin;
  }
}
