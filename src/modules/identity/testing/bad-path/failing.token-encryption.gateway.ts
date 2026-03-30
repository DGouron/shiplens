import { TokenEncryptionGateway } from '../../entities/linear-workspace-connection/token-encryption.gateway.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingTokenEncryptionGateway extends TokenEncryptionGateway {
  async encrypt(_plaintext: string): Promise<string> {
    throw new GatewayError('Encryption failed');
  }

  async decrypt(_ciphertext: string): Promise<string> {
    throw new GatewayError('Decryption failed');
  }
}
