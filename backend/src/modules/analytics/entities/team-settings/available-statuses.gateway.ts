export abstract class AvailableStatusesGateway {
  abstract getDistinctStatusNames(teamId: string): Promise<string[]>;
}
