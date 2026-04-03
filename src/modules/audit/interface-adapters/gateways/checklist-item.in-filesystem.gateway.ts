import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ChecklistItemGateway } from '../../entities/checklist-item/checklist-item.gateway.js';
import { ChecklistItem } from '../../entities/checklist-item/checklist-item.js';

const storedChecklistItemSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  origin: z.string(),
});

@Injectable()
export class ChecklistItemInFilesystemGateway extends ChecklistItemGateway {
  constructor(private readonly directory: string) {
    super();
  }

  async save(item: ChecklistItem): Promise<void> {
    if (!existsSync(this.directory)) {
      await mkdir(this.directory, { recursive: true });
    }

    const filePath = join(this.directory, `${item.identifier}.json`);
    const stored = {
      identifier: item.identifier,
      name: item.name,
      origin: item.origin,
    };

    await writeFile(filePath, JSON.stringify(stored, null, 2), 'utf-8');
  }

  async findAll(): Promise<ChecklistItem[]> {
    if (!existsSync(this.directory)) {
      return [];
    }

    const files = await readdir(this.directory);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    const items: ChecklistItem[] = [];
    for (const file of jsonFiles) {
      const content = await readFile(join(this.directory, file), 'utf-8');
      const stored: unknown = JSON.parse(content);
      const data = storedChecklistItemSchema.parse(stored);
      items.push(ChecklistItem.create(data));
    }

    return items;
  }
}
