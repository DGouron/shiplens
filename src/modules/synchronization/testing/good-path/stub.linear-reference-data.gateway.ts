import { LinearReferenceDataGateway } from '../../entities/reference-data/linear-reference-data.gateway.js';
import { type TeamReferenceData } from '../../entities/reference-data/reference-data.schema.js';

export class StubLinearReferenceDataGateway extends LinearReferenceDataGateway {
  private dataByTeamId: Map<string, TeamReferenceData> = new Map([
    [
      'team-1',
      {
        teamId: 'team-1',
        labels: [
          { externalId: 'label-1', teamId: 'team-1', name: 'Bug', color: '#ef4444' },
          { externalId: 'label-2', teamId: 'team-1', name: 'Feature', color: '#3b82f6' },
          { externalId: 'label-3', teamId: 'team-1', name: 'Improvement', color: '#8b5cf6' },
          { externalId: 'label-4', teamId: 'team-1', name: 'Urgent', color: '#f97316' },
          { externalId: 'label-5', teamId: 'team-1', name: 'Design', color: '#ec4899' },
          { externalId: 'label-6', teamId: 'team-1', name: 'Backend', color: '#14b8a6' },
          { externalId: 'label-7', teamId: 'team-1', name: 'Frontend', color: '#eab308' },
          { externalId: 'label-8', teamId: 'team-1', name: 'Documentation', color: '#6b7280' },
        ],
        workflowStatuses: [
          { externalId: 'status-1', teamId: 'team-1', name: 'Backlog', position: 0 },
          { externalId: 'status-2', teamId: 'team-1', name: 'Todo', position: 1 },
          { externalId: 'status-3', teamId: 'team-1', name: 'In Progress', position: 2 },
          { externalId: 'status-4', teamId: 'team-1', name: 'In Review', position: 3 },
          { externalId: 'status-5', teamId: 'team-1', name: 'Done', position: 4 },
        ],
        teamMembers: [
          { externalId: 'member-1', teamId: 'team-1', name: 'Alice Martin', role: 'admin' },
          { externalId: 'member-2', teamId: 'team-1', name: 'Bob Dupont', role: 'member' },
          { externalId: 'member-3', teamId: 'team-1', name: 'Charlie Durand', role: 'member' },
          { externalId: 'member-4', teamId: 'team-1', name: 'Diana Petit', role: 'member' },
          { externalId: 'member-5', teamId: 'team-1', name: 'Eve Bernard', role: 'guest' },
          { externalId: 'member-6', teamId: 'team-1', name: 'Frank Moreau', role: 'member' },
        ],
        projects: [
          {
            externalId: 'project-1',
            teamId: 'team-1',
            name: 'Website Redesign',
            milestones: [
              { externalId: 'ms-1', projectExternalId: 'project-1', name: 'Phase 1' },
              { externalId: 'ms-2', projectExternalId: 'project-1', name: 'Phase 2' },
            ],
          },
          {
            externalId: 'project-2',
            teamId: 'team-1',
            name: 'API Migration',
            milestones: [],
          },
          {
            externalId: 'project-3',
            teamId: 'team-1',
            name: 'Mobile App',
            milestones: [],
          },
        ],
      },
    ],
  ]);

  async getTeamReferenceData(
    _accessToken: string,
    teamId: string,
  ): Promise<TeamReferenceData> {
    const data = this.dataByTeamId.get(teamId);
    if (!data) {
      return {
        teamId,
        labels: [],
        workflowStatuses: [],
        teamMembers: [],
        projects: [],
      };
    }
    return { ...data };
  }

  renameFirstLabel(teamId: string, newName: string): void {
    const data = this.dataByTeamId.get(teamId);
    if (data && data.labels.length > 0) {
      data.labels[0] = { ...data.labels[0], name: newName };
    }
  }
}
