import { LinearIssueDataInHttpGateway } from '@modules/synchronization/interface-adapters/gateways/linear-issue-data.in-http.gateway.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createFetchResponse(data: unknown): Response {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function generateIssueNodes(
  count: number,
  startIndex = 0,
): Array<{ id: string }> {
  return Array.from({ length: count }, (_, index) => ({
    id: `issue-${startIndex + index + 1}`,
  }));
}

function createCycleResponse(
  issueNodes: Array<{ id: string }>,
  hasNextPage: boolean,
  endCursor: string | null,
) {
  return createFetchResponse({
    team: {
      cycles: {
        nodes: [
          {
            id: 'cycle-1',
            name: 'Sprint 1',
            number: 1,
            startsAt: '2026-01-01T00:00:00Z',
            endsAt: '2026-01-14T00:00:00Z',
            issues: {
              nodes: issueNodes,
              pageInfo: { hasNextPage, endCursor },
            },
          },
        ],
      },
    },
  });
}

function createCycleIssuePageResponse(
  issueNodes: Array<{ id: string }>,
  hasNextPage: boolean,
  endCursor: string | null,
) {
  return createFetchResponse({
    cycle: {
      issues: {
        nodes: issueNodes,
        pageInfo: { hasNextPage, endCursor },
      },
    },
  });
}

interface GraphqlIssueNode {
  id: string;
  title: string;
  state: { name: string; type: string };
  estimate: number | null;
  labels: { nodes: Array<{ id: string }> };
  assignee: { name: string } | null;
  project: { id: string } | null;
  createdAt: string;
  updatedAt: string;
}

function createIssuesPageResponse(issueNodes: GraphqlIssueNode[]) {
  return createFetchResponse({
    team: {
      issues: {
        nodes: issueNodes,
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  });
}

describe('LinearIssueDataInHttpGateway', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCycles — archived cycles', () => {
    it('sends includeArchived: true in the GraphQL query', async () => {
      const gateway = new LinearIssueDataInHttpGateway();
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createCycleResponse([], false, null));

      vi.stubGlobal('fetch', mockFetch);

      await gateway.getCycles('test-token', 'team-1');

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.query).toContain('includeArchived');
    });
  });

  describe('getCycles — issue pagination', () => {
    it('fetches all issue IDs across multiple pages for a cycle', async () => {
      const gateway = new LinearIssueDataInHttpGateway();
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(
          createCycleResponse(generateIssueNodes(50), true, 'cursor-50'),
        )
        .mockResolvedValueOnce(
          createCycleIssuePageResponse(
            generateIssueNodes(50, 50),
            true,
            'cursor-100',
          ),
        )
        .mockResolvedValueOnce(
          createCycleIssuePageResponse(
            generateIssueNodes(50, 100),
            true,
            'cursor-150',
          ),
        )
        .mockResolvedValueOnce(
          createCycleIssuePageResponse(
            generateIssueNodes(23, 150),
            false,
            null,
          ),
        );

      vi.stubGlobal('fetch', mockFetch);

      const cycles = await gateway.getCycles('test-token', 'team-1');

      const issueIds: string[] = JSON.parse(cycles[0].issueExternalIds);
      expect(issueIds).toHaveLength(173);
    });

    it('does not make extra requests when all issues fit in one page', async () => {
      const gateway = new LinearIssueDataInHttpGateway();
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(
          createCycleResponse(generateIssueNodes(30), false, null),
        );

      vi.stubGlobal('fetch', mockFetch);

      const cycles = await gateway.getCycles('test-token', 'team-1');

      const issueIds: string[] = JSON.parse(cycles[0].issueExternalIds);
      expect(issueIds).toHaveLength(30);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles a cycle with zero issues', async () => {
      const gateway = new LinearIssueDataInHttpGateway();
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createCycleResponse([], false, null));

      vi.stubGlobal('fetch', mockFetch);

      const cycles = await gateway.getCycles('test-token', 'team-1');

      const issueIds: string[] = JSON.parse(cycles[0].issueExternalIds);
      expect(issueIds).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getIssuesPage — project attribution', () => {
    it('maps project.id to projectExternalId when present', async () => {
      const gateway = new LinearIssueDataInHttpGateway();
      const mockFetch = vi.fn().mockResolvedValueOnce(
        createIssuesPageResponse([
          {
            id: 'issue-1',
            title: 'Issue 1',
            state: { name: 'Todo', type: 'unstarted' },
            estimate: null,
            labels: { nodes: [] },
            assignee: null,
            project: { id: 'project-abc' },
            createdAt: '2026-01-15T10:00:00Z',
            updatedAt: '2026-01-16T10:00:00Z',
          },
        ]),
      );

      vi.stubGlobal('fetch', mockFetch);

      const page = await gateway.getIssuesPage('test-token', 'team-1', null);

      expect(page.issues[0].projectExternalId).toBe('project-abc');
    });

    it('maps missing project to null projectExternalId', async () => {
      const gateway = new LinearIssueDataInHttpGateway();
      const mockFetch = vi.fn().mockResolvedValueOnce(
        createIssuesPageResponse([
          {
            id: 'issue-2',
            title: 'Issue 2',
            state: { name: 'Todo', type: 'unstarted' },
            estimate: null,
            labels: { nodes: [] },
            assignee: null,
            project: null,
            createdAt: '2026-01-15T10:00:00Z',
            updatedAt: '2026-01-16T10:00:00Z',
          },
        ]),
      );

      vi.stubGlobal('fetch', mockFetch);

      const page = await gateway.getIssuesPage('test-token', 'team-1', null);

      expect(page.issues[0].projectExternalId).toBeNull();
    });

    it('includes project { id } in the GraphQL query', async () => {
      const gateway = new LinearIssueDataInHttpGateway();
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(createIssuesPageResponse([]));

      vi.stubGlobal('fetch', mockFetch);

      await gateway.getIssuesPage('test-token', 'team-1', null);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.query).toContain('project { id }');
    });
  });
});
