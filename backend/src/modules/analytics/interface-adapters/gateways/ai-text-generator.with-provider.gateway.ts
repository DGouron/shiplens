import { Injectable } from '@nestjs/common';
import {
  type AiProvider,
  AiTextGeneratorGateway,
} from '../../entities/sprint-report/ai-text-generator.gateway.js';
import { AiProviderUnavailableError } from '../../entities/sprint-report/sprint-report.errors.js';

interface ProviderConfig {
  url: string;
  model: string;
  authHeader: string;
  authEnvVariable: string;
}

const PROVIDER_CONFIGS: Record<AiProvider, ProviderConfig> = {
  OpenAI: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    authHeader: 'Authorization',
    authEnvVariable: 'OPENAI_API_KEY',
  },
  Anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-opus-4-7',
    authHeader: 'x-api-key',
    authEnvVariable: 'ANTHROPIC_API_KEY',
  },
  Ollama: {
    url: 'http://localhost:11434/api/generate',
    model: 'llama3',
    authHeader: '',
    authEnvVariable: '',
  },
};

@Injectable()
export class AiTextGeneratorWithProviderGateway extends AiTextGeneratorGateway {
  async generate(prompt: string, provider: AiProvider): Promise<string> {
    const config = PROVIDER_CONFIGS[provider];

    try {
      if (provider === 'Ollama') {
        return await this.callOllama(prompt, config);
      }

      if (provider === 'Anthropic') {
        return await this.callAnthropic(prompt, config);
      }

      return await this.callOpenAi(prompt, config);
    } catch (error) {
      if (error instanceof AiProviderUnavailableError) {
        throw error;
      }
      throw new AiProviderUnavailableError();
    }
  }

  private async callOpenAi(
    prompt: string,
    config: ProviderConfig,
  ): Promise<string> {
    const apiKey = process.env[config.authEnvVariable];
    if (!apiKey) {
      throw new AiProviderUnavailableError();
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [config.authHeader]: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new AiProviderUnavailableError();
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0].message.content;
  }

  private async callAnthropic(
    prompt: string,
    config: ProviderConfig,
  ): Promise<string> {
    const apiKey = process.env[config.authEnvVariable];
    if (!apiKey) {
      throw new AiProviderUnavailableError();
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [config.authHeader]: apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new AiProviderUnavailableError();
    }

    const data = (await response.json()) as {
      content: Array<{ text: string }>;
    };
    return data.content[0].text;
  }

  private async callOllama(
    prompt: string,
    config: ProviderConfig,
  ): Promise<string> {
    const ollamaUrl = process.env.OLLAMA_URL ?? config.url;

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new AiProviderUnavailableError();
    }

    const data = (await response.json()) as { response: string };
    return data.response;
  }
}
