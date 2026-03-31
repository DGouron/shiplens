import { describe, it, expect } from 'vitest';
import { SyncProgress } from '@modules/synchronization/entities/sync-progress/sync-progress.js';

describe('SyncProgress', () => {
  it('creates a new sync progress with in_progress status', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 150,
      syncedIssues: 0,
      status: 'in_progress',
      cursor: null,
    });

    expect(progress.status).toBe('in_progress');
    expect(progress.progressPercentage).toBe(0);
  });

  it('computes progress percentage', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 500,
      syncedIssues: 200,
      status: 'in_progress',
      cursor: 'cursor-abc',
    });

    expect(progress.progressPercentage).toBe(40);
  });

  it('advances synced issues count and updates cursor', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 150,
      syncedIssues: 0,
      status: 'in_progress',
      cursor: null,
    });

    const advanced = progress.advance(50, 'cursor-page-2');

    expect(advanced.syncedIssues).toBe(50);
    expect(advanced.cursor).toBe('cursor-page-2');
    expect(advanced.progressPercentage).toBe(33);
  });

  it('marks as completed', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 150,
      syncedIssues: 150,
      status: 'in_progress',
      cursor: null,
    });

    const completed = progress.complete();

    expect(completed.status).toBe('completed');
    expect(completed.progressPercentage).toBe(100);
  });

  it('marks as failed', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 150,
      syncedIssues: 50,
      status: 'in_progress',
      cursor: 'cursor-abc',
    });

    const failed = progress.fail();

    expect(failed.status).toBe('failed');
  });

  it('can resume from a failed state', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 150,
      syncedIssues: 50,
      status: 'failed',
      cursor: 'cursor-abc',
    });

    expect(progress.canResume).toBe(true);
    expect(progress.cursor).toBe('cursor-abc');
  });

  it('cannot resume from a completed state', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 150,
      syncedIssues: 150,
      status: 'completed',
      cursor: null,
    });

    expect(progress.canResume).toBe(false);
  });

  it('returns 100% for zero total issues', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 0,
      syncedIssues: 0,
      status: 'in_progress',
      cursor: null,
    });

    expect(progress.progressPercentage).toBe(100);
  });

  it('exposes teamId', () => {
    const progress = SyncProgress.create({
      teamId: 'team-1',
      totalIssues: 100,
      syncedIssues: 0,
      status: 'in_progress',
      cursor: null,
    });

    expect(progress.teamId).toBe('team-1');
  });
});
