import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.ts';
import {
  type StatusListResponse,
  type TimezoneResponse,
} from '../../entities/team-settings/team-settings.response.ts';
import {
  statusListResponseGuard,
  timezoneResponseGuard,
} from './team-settings.response.guard.ts';

export class TeamSettingsInHttpGateway extends TeamSettingsGateway {
  async getTimezone(teamId: string): Promise<TimezoneResponse> {
    const response = await fetch(
      `/settings/teams/${encodeURIComponent(teamId)}/timezone`,
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch timezone: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = timezoneResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid timezone response: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async setTimezone(teamId: string, timezone: string): Promise<void> {
    const response = await fetch(
      `/settings/teams/${encodeURIComponent(teamId)}/timezone`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      },
    );
    if (!response.ok) {
      throw new GatewayError(`Failed to set timezone: HTTP ${response.status}`);
    }
  }

  async getAvailableStatuses(teamId: string): Promise<StatusListResponse> {
    const response = await fetch(
      `/settings/teams/${encodeURIComponent(teamId)}/available-statuses`,
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch available statuses: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = statusListResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid available statuses response: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async getExcludedStatuses(teamId: string): Promise<StatusListResponse> {
    const response = await fetch(
      `/settings/teams/${encodeURIComponent(teamId)}/excluded-statuses`,
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch excluded statuses: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = statusListResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid excluded statuses response: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async setExcludedStatuses(teamId: string, statuses: string[]): Promise<void> {
    const response = await fetch(
      `/settings/teams/${encodeURIComponent(teamId)}/excluded-statuses`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statuses }),
      },
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to set excluded statuses: HTTP ${response.status}`,
      );
    }
  }
}
