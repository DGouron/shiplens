export abstract class AvailableStatusesGateway {
  abstract getDistinctStatusNames(teamId: string): Promise<string[]>;
  abstract getDistinctTransitionStatusNames(teamId: string): Promise<string[]>;
}
