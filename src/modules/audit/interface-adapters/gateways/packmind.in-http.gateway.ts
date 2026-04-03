import { Injectable } from '@nestjs/common';
import { GatewayError } from '@shared/foundation/gateway-error.js';
import { InvalidPackmindTokenError } from '../../entities/packmind/packmind.errors.js';
import { PackmindGateway } from '../../entities/packmind/packmind.gateway.js';
import { type PackmindPractice } from '../../entities/packmind/packmind-practice.js';

interface PackmindApiPractice {
  id: string;
  title: string;
  type: 'measurable' | 'qualitative';
  condition?: string;
  severity?: string;
}

@Injectable()
export class PackmindInHttpGateway extends PackmindGateway {
  constructor(private readonly baseUrl: string) {
    super();
  }

  async fetchPractices(token: string): Promise<PackmindPractice[]> {
    const response = await this.callApi(token);
    return response.map(this.toPractice);
  }

  private async callApi(token: string): Promise<PackmindApiPractice[]> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/api/practices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new GatewayError('Packmind est injoignable.');
    }

    if (response.status === 401 || response.status === 403) {
      throw new InvalidPackmindTokenError();
    }

    if (!response.ok) {
      throw new GatewayError(
        `Packmind a retourne une erreur ${response.status}.`,
      );
    }

    return response.json() as Promise<PackmindApiPractice[]>;
  }

  private toPractice(apiPractice: PackmindApiPractice): PackmindPractice {
    return {
      identifier: apiPractice.id,
      name: apiPractice.title,
      measurable: apiPractice.type === 'measurable',
      conditionExpression: apiPractice.condition,
      severity: apiPractice.severity,
    };
  }
}
