import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { AiTextGeneratorGateway } from '../../entities/sprint-report/ai-text-generator.gateway.js';
import { AiProviderUnavailableError } from '../../entities/sprint-report/sprint-report.errors.js';

const CLAUDE_CLI_TIMEOUT_MS = 300_000;

function resolveClaudePath(): string {
  try {
    const result = execSync('which claude', { encoding: 'utf-8' });
    const resolved = result.trim();
    if (existsSync(resolved)) {
      return resolved;
    }
  } catch {
    // which failed
  }

  const commonPaths = [
    join(homedir(), '.local', 'bin', 'claude'),
    '/usr/local/bin/claude',
    '/usr/bin/claude',
  ];

  for (const candidate of commonPaths) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return 'claude';
}

@Injectable()
export class AiTextGeneratorWithClaudeCliGateway extends AiTextGeneratorGateway {
  private readonly logger = new Logger(
    AiTextGeneratorWithClaudeCliGateway.name,
  );

  async generate(prompt: string): Promise<string> {
    this.logger.log('Calling Claude CLI...');

    const claudePath = resolveClaudePath();
    this.logger.log(`Claude path: ${claudePath}`);

    return new Promise((resolve, reject) => {
      const args = [
        '--print',
        '--model',
        'claude-sonnet-4-20250514',
        '--setting-sources',
        'user',
        '-p',
        prompt,
      ];

      const childEnv = { ...process.env };
      delete childEnv.CLAUDECODE;

      const proc = spawn(claudePath, args, {
        cwd: '/tmp',
        env: {
          ...childEnv,
          TERM: 'dumb',
          CI: 'true',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timeout = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGKILL');
      }, CLAUDE_CLI_TIMEOUT_MS);

      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('error', (error) => {
        clearTimeout(timeout);
        this.logger.error(`Claude CLI launch failed: ${error.message}`);
        reject(new AiProviderUnavailableError());
      });

      proc.on('close', (code) => {
        clearTimeout(timeout);
        if (timedOut) {
          this.logger.error('Claude CLI timed out (300s)');
          reject(new AiProviderUnavailableError());
          return;
        }
        if (code === 0) {
          this.logger.log(`Claude CLI responded (${stdout.length} chars)`);
          resolve(stdout);
        } else {
          this.logger.error(
            `Claude CLI exited with code ${code}: ${stderr.substring(0, 500)}`,
          );
          reject(new AiProviderUnavailableError());
        }
      });
    });
  }
}
