export type AiProvider = 'OpenAI' | 'Anthropic' | 'Ollama';

export abstract class AiTextGeneratorGateway {
  abstract generate(prompt: string, provider: AiProvider): Promise<string>;
}
