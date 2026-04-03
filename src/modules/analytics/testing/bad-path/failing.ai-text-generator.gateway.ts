import {
  type AiProvider,
  AiTextGeneratorGateway,
} from '../../entities/sprint-report/ai-text-generator.gateway.js';
import { AiProviderUnavailableError } from '../../entities/sprint-report/sprint-report.errors.js';

export class FailingAiTextGeneratorGateway extends AiTextGeneratorGateway {
  async generate(_prompt: string, _provider: AiProvider): Promise<string> {
    throw new AiProviderUnavailableError();
  }
}
