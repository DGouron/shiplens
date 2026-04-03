import {
  type AiProvider,
  AiTextGeneratorGateway,
} from '../../entities/sprint-report/ai-text-generator.gateway.js';

export class StubAiTextGeneratorGateway extends AiTextGeneratorGateway {
  generatedText = JSON.stringify({
    executiveSummary: "Le sprint s'est bien déroulé avec une vélocité stable.",
    trends:
      'La vélocité est en hausse de 10% par rapport aux 3 derniers sprints.',
    highlights: 'Migration de la base de données terminée en avance.',
    risks: 'Deux issues critiques restent ouvertes.',
    recommendations:
      'Prioriser la résolution des issues critiques au prochain sprint.',
  });

  receivedPrompt = '';
  receivedProvider: AiProvider | null = null;

  async generate(prompt: string, provider: AiProvider): Promise<string> {
    this.receivedPrompt = prompt;
    this.receivedProvider = provider;
    return this.generatedText;
  }
}
