import { z } from 'zod';

export const webhookEventActionSchema = z.enum(['create', 'update', 'remove']);

export const webhookEventTypeSchema = z.enum(['Issue', 'Cycle', 'Comment']);

export const webhookEventStatusSchema = z.enum(['pending', 'processed', 'failed']);

export const webhookEventPropsSchema = z.object({
  deliveryId: z.string().min(1),
  action: z.string().min(1),
  type: z.string().min(1),
  teamId: z.string().min(1),
  status: webhookEventStatusSchema,
  attempts: z.number().int().min(0),
  receivedAt: z.string().min(1),
  processedAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
  data: z.record(z.string(), z.unknown()),
});

export type WebhookEventAction = z.infer<typeof webhookEventActionSchema>;
export type WebhookEventType = z.infer<typeof webhookEventTypeSchema>;
export type WebhookEventStatus = z.infer<typeof webhookEventStatusSchema>;
export type WebhookEventProps = z.infer<typeof webhookEventPropsSchema>;

export const webhookIssueDataSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  title: z.string().min(1),
  statusName: z.string().min(1),
  statusType: z.string().min(1),
  points: z.number().nullable(),
  labelIds: z.string(),
  assigneeName: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  previousStatusName: z.string().optional(),
  previousStatusType: z.string().optional(),
});

export const webhookIssueDeleteDataSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
});

export type WebhookIssueData = z.infer<typeof webhookIssueDataSchema>;
export type WebhookIssueDeleteData = z.infer<typeof webhookIssueDeleteDataSchema>;
