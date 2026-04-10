import { TokenEncryptionGateway } from '../../entities/linear-workspace-connection/token-encryption.gateway.js';

export class StubTokenEncryptionGateway extends TokenEncryptionGateway {
  async encrypt(plaintext: string): Promise<string> {
    return `encrypted:${plaintext}`;
  }

  async decrypt(ciphertext: string): Promise<string> {
    return ciphertext.replace('encrypted:', '');
  }
}
