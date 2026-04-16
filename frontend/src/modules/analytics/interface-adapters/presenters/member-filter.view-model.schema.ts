import { z } from 'zod';

export const memberFilterOptionViewModelSchema = z.object({
  value: z.string(),
  label: z.string(),
  isSelected: z.boolean(),
  isWholeTeam: z.boolean(),
});

export const memberFilterViewModelSchema = z.object({
  label: z.string(),
  selectedValue: z.string(),
  options: z.array(memberFilterOptionViewModelSchema),
});

export type MemberFilterOptionViewModel = z.infer<
  typeof memberFilterOptionViewModelSchema
>;
export type MemberFilterViewModel = z.infer<typeof memberFilterViewModelSchema>;
